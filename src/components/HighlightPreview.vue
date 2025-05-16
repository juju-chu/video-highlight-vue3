<template>
  <div
    class="relative h-full flex flex-col"
  >
    <video
      ref="videoRef"
      class="w-full"
      controls
      @timeupdate="onTimeUpdate"
    >
      <source
        src="/sample.mp4"
        type="video/mp4"
      />
    </video>
    <div
      class="absolute bottom-10 left-0 w-full text-center text-white text-xl bg-black/50 py-2"
    >
      {{ currentText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import { useTranscriptStore } from '../store'

defineComponent({
  name: 'HighlightPreview'
})

const videoRef = ref<HTMLVideoElement | null>(null)
const currentText = ref('')

const store = useTranscriptStore()
const items = store.transcript
const selected = store.selectedIds

function onTimeUpdate() {
  const time = videoRef.value?.currentTime ?? 0
  const found = items.find(item =>
    selected.has(item.id) && time >= item.start && time <= item.end
  )
  currentText.value = found?.text ?? ''
}
</script>
