<template>
  <div class="flex h-screen">
    <TranscriptEditor
      class="w-1/2 border-r overflow-auto"
      @seek="handleSeek"
    />
    <VideoPlayer
      ref="videoPlayerRef"
      class="w-1/2"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TranscriptEditor from './components/TranscriptEditor.vue'
import HighlightPreview from './components/HighlightPreview.vue'
import VideoPlayer from './components/VideoPlayer.vue'

const videoPlayerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)

const handleSeek = (time: number) => {
  videoPlayerRef.value?.seekTo(time)
}
</script>
