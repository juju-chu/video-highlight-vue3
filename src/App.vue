<template>
  <div
    class="lg:min-h-screen h-screen flex flex-col lg:flex-row-reverse"
  >
    <!-- 影片播放區塊 -->
    <div
      class="w-full lg:w-1/2 lg:h-screen lg:border-l"
    >
      <VideoPlayer
        ref="videoPlayerRef"
        class="sticky top-0 w-full"
        @timeupdate="handleTimeUpdate"
        @fileSelected="handleFileSelected"
      />
    </div>

    <!-- 字幕區塊 -->
    <div
      class="w-full lg:w-1/2 lg:h-screen flex-1 border-t lg:border-t-0 overflow-auto"
    >
      <TranscriptEditor
        ref="transcriptEditorRef"
        @seek="handleSeek"
        :currentTime="currentTime"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TranscriptEditor from './components/TranscriptEditor.vue'
import VideoPlayer from './components/VideoPlayer.vue'

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)
const transcriptEditorRef = ref<InstanceType<typeof TranscriptEditor> | null>(null)
const currentTime = ref<number>(0)

const handleSeek = (time: number) => {
  videoPlayerRef.value?.seekTo(time)
}

const handleTimeUpdate = (time: number) => {
  currentTime.value = time
}

const handleFileSelected = async () => {
  // 當影片被選擇後，載入字幕
  await transcriptEditorRef.value?.loadTranscript()
}
</script>
