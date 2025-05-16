<template>
  <div class="flex h-screen">
    <TranscriptEditor
      class="w-1/2 border-r overflow-auto"
    />
    <VideoPlayer
      class="w-1/2"
    />
  </div>
</template>

<script setup lang="ts">
import TranscriptEditor from './components/TranscriptEditor.vue'
import HighlightPreview from './components/HighlightPreview.vue'
import VideoPlayer from './components/VideoPlayer.vue'
</script>
