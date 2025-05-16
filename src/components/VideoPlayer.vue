<template>
  <div
    class="flex flex-col gap-4 h-screen bg-gray-800 p-4 text-white"
  >
    <h2
      class="text-xl font-bold mb-4 p-2 rounded w-full"
    >
      Preview
    </h2>
    <!-- 上傳影片 -->
    <input
      type="file"
      accept="video/*"
      @change="onFileChange"
      class="mb-2"
    />

    <!-- 影片與字幕區塊 -->
    <div
      class="relative w-full max-h-[400px]"
    >
      <!-- 播放影片 -->
      <video
        v-if="videoUrl"
        ref="videoRef"
        class="w-full max-h-[400px] rounded"
        controls
        playsinline
        @error="onVideoError"
        @loadeddata="onVideoLoaded"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

// refs
const videoRef = ref<HTMLVideoElement | null>(null)
const videoUrl = ref<string>('/video-highlight-vue3/sample.mp4')

const transcript = ref<{ start: number; end: number; text: string }[]>([])
const currentOverlay = ref<{ start: number; end: number; text: string } | null>(null)

let animationFrameId: number

// 上傳影片並取得 URL
function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    videoUrl.value = URL.createObjectURL(file)
  }
}

// 載入 transcript JSON
onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}mock/transcript.json`)
    if (!response.ok) throw new Error('Failed to fetch transcript.json')
    transcript.value = await response.json()
    console.log('✅ Transcript loaded', transcript.value)
  } catch (error) {
    console.error('❌ Error loading transcript:', error)
  }
})

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
    console.log('🎬 Video loaded, starting subtitle tracking...')
    cancelAnimationFrame(animationFrameId) // reset old loop
    animationFrameId = requestAnimationFrame(updateSubtitle)
  }
})

// 錯誤處理
function onVideoError() {
  console.error('❌ 影片無法播放，請確認格式或重新上傳')
}

function onVideoLoaded() {
  console.log('✅ 影片成功載入')
}

// 清除動畫 frame
onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
video {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>
