<template>
  <div
    class="flex flex-col gap-4 h-full bg-gray-800 p-4 text-white w-full"
  >
    <h2
      class="text-xl font-bold mb-4 p-2 rounded w-full"
    >
      Preview
    </h2>
    <!-- 影片容器 -->
    <div
      class="video-container relative aspect-video bg-black mb-2 sm:mb-4 rounded overflow-hidden"
    >
      <video
        ref="videoRef"
        :key="videoKey"
        :src="videoUrl"
        class="w-full h-full transition-opacity duration-300"
        :style="{ opacity: videoOpacity }"
        @error="onVideoError"
        playsinline
        webkit-playsinline
      />

      <!-- 字幕顯示 -->
      <div
        v-if="currentOverlay"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-30 text-white p-2 rounded text-sm sm:text-base"
      >
        {{ currentOverlay.text }}
      </div>
    </div>

    <!-- 控制列 -->
    <div
      v-if="videoRef"
      class="flex flex-col gap-1 sm:gap-2"
    >
      <!-- 播放控制按鈕 -->
      <div
        class="flex items-center justify-center gap-2 sm:gap-4"
      >
        <button
          class="p-2 text-white hover:text-[#3c82f6] transition-colors"
          @click="seekTo(0)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          class="p-2 text-white hover:text-[#3c82f6] transition-colors"
          @click="togglePlay"
        >
          <svg
            v-if="!isPlaying"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        <button
          class="p-2 text-white hover:text-[#3c82f6] transition-colors"
          @click="seekTo(videoRef.duration)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- 時間軸 -->
      <div class="video-container">
        <div class="relative w-full">
          <!-- 時間軸軌道 -->
          <div
            class="w-full h-4 bg-[#374151] rounded cursor-pointer relative"
            @click="handleTimelineClick"
          >
            <!-- Highlight 片段 -->
            <div
              v-for="segment in highlightSegments"
              :key="segment.id"
              class="absolute inset-y-0 bg-[#3c82f6]"
              :style="{
                left: `${(segment.start / videoRef.duration) * 100}%`,
                width: `${((segment.end - segment.start) / videoRef.duration) * 100}%`
              }"
            />
            <!-- 當前時間指示器 -->
            <div
              class="absolute inset-y-0 w-0.5 bg-[#dd4c58]"
              :style="{
                left: `${(currentTime / videoRef.duration) * 100}%`
              }"
            />
          </div>
        </div>
        <!-- 總時長顯示 -->
        <div
          class="absolute right-0 -top-6 text-white text-sm"
        >
          {{ formatTime(videoRef.duration) }}
        </div>
      </div>
    </div>

    <!-- 上傳影片 -->
    <div
      class="flex flex-col gap-1 sm:gap-2 mt-2 sm:mt-4"
    >
      <input
        ref="fileInput"
        type="file"
        accept="video/*"
        class="hidden"
        @change="onFileChange"
      />
      <button
        class="bg-[#3c82f6] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base hover:bg-[#2563eb] transition-colors"
        @click="fileInput?.click()"
      >
        選擇影片
      </button>
      <div
        v-if="fileName"
        class="text-xs sm:text-sm text-gray-300"
      >
        已選擇檔案：{{ fileName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onUnmounted, defineOptions, computed } from 'vue'
import { useTranscriptStore } from '../store'
import { storeToRefs } from 'pinia'

// refs
const videoRef = ref<HTMLVideoElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const videoUrl = ref<string>('')
const fileName = ref<string>('')
const videoKey = ref<number>(0) // 用來強制重新渲染 video 元素
const currentTime = ref<number>(0)
const isPlaying = ref<boolean>(false)
const videoOpacity = ref<number>(1) // 控制影片透明度，1 表示完全不透明，0 表示完全透明

const store = useTranscriptStore()
const { transcript } = storeToRefs(store)

// 計算所有被選中的片段
const highlightSegments = computed(() => {
  return transcript.value.filter(item => item.highlight)
})

// 格式化時間
function formatTime(seconds: number): string {
  if (!seconds) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'))
  }
  parts.push(minutes.toString().padStart(2, '0'))
  parts.push(remainingSeconds.toString().padStart(2, '0'))

  return parts.join(':')
}

// 切換播放/暫停
const togglePlay = () => {
  if (!videoRef.value || highlightSegments.value.length === 0) return
  
  if (videoRef.value.paused) {
    // 如果當前時間在最後一個片段的結尾，則回到第一個片段的開頭
    const lastSegmentEnd = highlightSegments.value[highlightSegments.value.length - 1].end
    if (Math.abs(videoRef.value.currentTime - lastSegmentEnd) < 0.1) {
      videoRef.value.currentTime = highlightSegments.value[0].start
    }
    videoRef.value.play()
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

// 跳轉到指定時間
const seekTo = (time: number) => {
  if (videoRef.value) {
    videoRef.value.currentTime = time
    if (time === videoRef.value.duration) {
      videoRef.value.currentTime = highlightSegments.value[highlightSegments.value.length - 1].end
      videoRef.value.pause()
      isPlaying.value = false
    }
    videoRef.value.play()
  }
}

defineOptions({
  name: 'VideoPlayer'
})

const emit = defineEmits(['timeupdate', 'fileSelected'])

// 計算影片透明度
function calculateVideoOpacity(currentTime: number, segments: { start: number; end: number }[]): number {
  const threshold = 0.5 // 臨界值為 0.5 秒
  const minOpacity = 0.5 // 最小透明度
  const maxOpacity = 1 // 最大透明度

  // 如果沒有片段，直接返回最大透明度
  if (segments.length === 0) return maxOpacity

  // 計算距離臨界點最近的距離
  let minDistance = Infinity
  
  segments.forEach((segment, index) => {
    // 如果是第一個片段，只檢查結束時間
    if (index === 0) {
      const distanceToEnd = Math.abs(currentTime - segment.end)
      // 檢查是否與下一個片段連續
      const nextSegment = segments[index + 1]
      const isConnectedToNext = nextSegment && nextSegment.start - segment.end <= 1
      if (!isConnectedToNext) {
        minDistance = Math.min(minDistance, distanceToEnd)
      }
    }
    // 如果是最後一個片段，只檢查開始時間
    else if (index === segments.length - 1) {
      const distanceToStart = Math.abs(currentTime - segment.start)
      // 檢查是否與前一個片段連續
      const prevSegment = segments[index - 1]
      const isConnectedToPrev = prevSegment && segment.start - prevSegment.end <= 1
      if (!isConnectedToPrev) {
        minDistance = Math.min(minDistance, distanceToStart)
      }
    }
    // 中間片段
    else {
      const distanceToStart = Math.abs(currentTime - segment.start)
      const distanceToEnd = Math.abs(currentTime - segment.end)
      
      // 檢查與前後片段的連續性
      const prevSegment = segments[index - 1]
      const nextSegment = segments[index + 1]
      const isConnectedToPrev = prevSegment && segment.start - prevSegment.end <= 1
      const isConnectedToNext = nextSegment && nextSegment.start - segment.end <= 1

      // 只有在非連續的情況下才考慮透明度
      if (!isConnectedToPrev) {
        minDistance = Math.min(minDistance, distanceToStart)
      }
      if (!isConnectedToNext) {
        minDistance = Math.min(minDistance, distanceToEnd)
      }
    }
  })

  // 計算透明度
  if (minDistance > threshold) {
    return maxOpacity
  } else {
    // 使用線性插值計算透明度
    const progress = minDistance / threshold
    return minOpacity + (maxOpacity - minOpacity) * progress
  }
}

// 監聽 currentTime 的變化
watch(currentTime, (newTime) => {
  emit('timeupdate', newTime)
  videoOpacity.value = calculateVideoOpacity(newTime, highlightSegments.value)
})

defineExpose({
  seekTo
})

const currentOverlay = ref<{ start: number; end: number; text: string } | null>(null)

let animationFrameId: number

// 上傳影片並取得 URL
async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    try {
      // 檢查檔案類型
      if (!file.type.startsWith('video/')) {
        throw new Error('請上傳影片檔案')
      }
      
      // 創建新的 URL
      videoUrl.value = URL.createObjectURL(file)
      // 設定檔案名稱
      fileName.value = file.name
      
      // 重置 input
      const fileInput = input
      if (fileInput) {
        fileInput.value = '';
      }
      // 強制重新渲染 video 元素
      videoKey.value++
      
      // 載入字幕並取得 highlight 片段
      const res = await fetch(`${import.meta.env.BASE_URL}mock/transcript.json`)
      const data = await res.json()
      store.setTranscript(data)
      
      // 發出文件選擇事件
      emit('fileSelected', file)
    } catch (error) {
      console.error('❌ 影片無法播放，請確認格式或重新上傳')
    }
  }
}

// 字幕即時更新
function updateSubtitle() {
  if (videoRef.value) {
    const currentTime = videoRef.value.currentTime
    const match = transcript.value.find(
      (item) => currentTime >= item.start && currentTime <= item.end
    )
    currentOverlay.value = match || null
  }
  animationFrameId = requestAnimationFrame(updateSubtitle)
}

// 處理 highlight 片段的跳轉邏輯
function handleHighlightSegmentJump(time: number) {
  if (!videoRef.value) return

  // 檢查當前時間是否在任何 highlight 片段內
  const isInHighlight = highlightSegments.value.some(
    (segment) => time >= segment.start && time <= segment.end
  )
  
  // 如果不在 highlight 片段內，找下一個 highlight 片段
  if (!isInHighlight) {
    const nextSegment = highlightSegments.value.find(
      (segment) => segment.start > time
    )
    
    if (nextSegment) {
      videoRef.value.currentTime = nextSegment.start
    } else {
      // 如果沒有下一個 highlight 片段，表示已經播放完最後一個片段
      videoRef.value.currentTime = highlightSegments.value[highlightSegments.value.length - 1].end
      videoRef.value.pause()
      isPlaying.value = false
    }
  }
}

// 當影片路徑改變，開始追蹤播放進度
watch(videoUrl, async (newUrl) => {
  if (!newUrl) return
  await nextTick()
  if (videoRef.value) {
    // 重新綁定事件監聽器
    videoRef.value.addEventListener('error', onVideoError)
    videoRef.value.addEventListener('loadeddata', () => {
      console.log('✅ 影片成功載入')
      console.log('🎬 開始追蹤字幕...')
      cancelAnimationFrame(animationFrameId) // reset old loop
      animationFrameId = requestAnimationFrame(updateSubtitle)
    })
    
    // 監聽時間更新
    videoRef.value.addEventListener('timeupdate', () => {
      if (videoRef.value) {
        const time = videoRef.value.currentTime
        currentTime.value = time
        handleHighlightSegmentJump(time)
      }
    })
    
    // 監聽播放狀態變化
    videoRef.value.addEventListener('play', () => {
      isPlaying.value = true
    })
    videoRef.value.addEventListener('pause', () => {
      isPlaying.value = false
    })
    videoRef.value.addEventListener('ended', () => {
      isPlaying.value = false
    })
  }
})

// 錯誤處理
function onVideoError() {
  console.error('❌ 影片無法播放，請確認格式或重新上傳')
}

// 清除動畫 frame 和 URL
onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  if (videoUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(videoUrl.value)
  }
})

watch(transcript, () => {
  // 當 transcript 更新時，重新檢查當前時間是否在 highlight 片段內
  if (videoRef.value) {
    handleHighlightSegmentJump(videoRef.value.currentTime)
  }
}, { deep: true })

// 處理時間軸點擊
function handleTimelineClick(event: MouseEvent) {
  if (!videoRef.value) return
  
  const currentPosition = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const clickPosition = event.clientX
  const percentage = (clickPosition - currentPosition.left) / currentPosition.width
  const clickTime = percentage * videoRef.value.duration
  
  videoRef.value.currentTime = clickTime
}
</script>

<style scoped>
video {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.video-container {
  width: 100%;
  max-width: calc(100vw - 32px);
}
</style>
