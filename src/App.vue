<template>
  <div class="flex h-screen">
    <TranscriptEditor
      ref="transcriptEditorRef"
      class="w-1/2 border-r overflow-auto"
      @seek="handleSeek"
      :currentTime="currentTime"
    />
    <VideoPlayer
      ref="videoPlayerRef"
      class="w-1/2"
      @timeupdate="handleTimeUpdate"
      @fileSelected="handleFileSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TranscriptEditor from './components/TranscriptEditor.vue'
import HighlightPreview from './components/HighlightPreview.vue'
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
