<template>
  <div
    class="flex flex-col gap-4 h-screen bg-gray-800 p-4 text-white"
  >
    <h2
      class="text-xl font-bold mb-4 p-2 rounded w-full"
    >
      Preview
    </h2>
    <!-- 影片與字幕區塊 -->
    <div
      class="relative w-full max-h-[400px]"
    >
      <!-- 播放影片 -->
      <video
        v-if="videoUrl"
        :key="videoKey"
        ref="videoRef"
        class="w-full max-h-[400px] rounded"
        controls
        playsinline
      >
        <source :src="videoUrl" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <!-- 字幕疊字 -->
      <div
        v-if="currentOverlay"
        class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-lg px-4 py-2 rounded max-w-[90%] text-center"
      >
        {{ currentOverlay.text }}
      </div>
    </div>
    <!-- 上傳影片 -->
    <div class="flex flex-col gap-2">
      <input
        ref="fileInput"
        type="file"
        accept="video/*"
        @change="onFileChange"
        class="hidden"
      />
      <button
        @click="$refs.fileInput?.click()"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-fit"
      >
        選擇影片
      </button>
      <div v-if="fileName" class="text-sm text-gray-300">
        已選擇檔案：{{ fileName }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onMounted, onUnmounted, defineOptions, computed } from 'vue'
import { useTranscriptStore } from '../store'
import { storeToRefs } from 'pinia'

// refs
const videoRef = ref<HTMLVideoElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const videoUrl = ref<string>('')
const fileName = ref<string>('')
const videoKey = ref<number>(0) // 用來強制重新渲染 video 元素
const currentTime = ref<number>(0)

const store = useTranscriptStore()
const { transcript } = storeToRefs(store)

// 計算所有被選中的片段
const highlightSegments = computed(() => {
  return transcript.value.filter(item => item.highlight)
})

// 跳轉到指定時間
const seekTo = (time: number) => {
  if (videoRef.value) {
    videoRef.value.currentTime = time
    videoRef.value.play()
  }
}

defineOptions({
  name: 'VideoPlayer'
})

const emit = defineEmits(['timeupdate', 'fileSelected'])

// 監聽 currentTime 的變化
watch(currentTime, (newTime) => {
  emit('timeupdate', newTime)
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
            // 如果沒有下一個 highlight 片段，跳到影片結尾
            videoRef.value.currentTime = videoRef.value.duration
          }
        }
      }
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
    const time = videoRef.value.currentTime
    const isInHighlight = highlightSegments.value.some(
      (segment) => time >= segment.start && time <= segment.end
    )
    
    if (!isInHighlight) {
      const nextSegment = highlightSegments.value.find(
        (segment) => segment.start > time
      )
      
      if (nextSegment) {
        videoRef.value.currentTime = nextSegment.start
      } else {
        videoRef.value.currentTime = videoRef.value.duration
      }
    }
  }
}, { deep: true })
</script>

<style scoped>
video {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>
