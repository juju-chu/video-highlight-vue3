<template>
  <div
    class="p-4"
  >
    <h2
      class="text-xl font-bold mb-4"
    >
      Transcript
    </h2>
    <div
      v-for="item in transcript"
      :key="item.id"
      class="mb-2"
    >
      <div
        class="text-gray-500 text-sm"
      >
        [{{ item.start }}s - {{ item.end }}s] {{ item.section }}
      </div>
      <div
        class="cursor-pointer"
        :class="selectedIds.has(item.id) ? 'bg-blue-100' : ''"
        @click="toggleSelect(item.id)"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranscriptStore } from '../store'

defineComponent({
  name: 'TranscriptEditor'
})
const store = useTranscriptStore()
const { transcript, selectedIds } = storeToRefs(store)
const { toggleSelect, setTranscript } = store

onMounted(async () => {
  const res = await fetch(`${import.meta.env.BASE_URL}mock/transcript.json`)
  const data = await res.json()
  setTranscript(data)
})
</script>
