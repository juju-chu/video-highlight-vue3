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
        class="text-sm"
        :class="{
          'text-gray-500 cursor-not-allowed': !item.highlight,
          'text-gray-500 cursor-pointer hover:text-gray-700': item.highlight
        }"
        @click="item.highlight && handleTimestampClick(item)"
      >
        [{{ item.start }}s - {{ item.end }}s] {{ item.section }}
      </div>
      <div
        class="cursor-pointer"
        :class="{
          'bg-green-50': item.highlight && !(props.currentTime >= item.start && props.currentTime <= item.end),
          'bg-green-200': item.highlight && (props.currentTime >= item.start && props.currentTime <= item.end)
        }"
        @click="handleTextClick(item)"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTranscriptStore, type TranscriptItem } from '../store'

const props = defineProps<{
  currentTime: number
}>()

const emit = defineEmits<{
  (e: 'seek', time: number): void
}>()

const store = useTranscriptStore()
const { transcript, selectedIds } = storeToRefs(store)
const { toggleSelect, setTranscript } = store

function handleTimestampClick(item: TranscriptItem) {
  emit('seek', item.start)
}

function handleTextClick(item: TranscriptItem) {
  // 更新 highlight 狀態
  const updatedTranscript = transcript.value.map((t) => 
    t.id === item.id ? { ...t, highlight: !t.highlight } : t
  )
  setTranscript(updatedTranscript)
}

// 載入字幕檔案
const loadTranscript = async () => {
  const res = await fetch(`${import.meta.env.BASE_URL}mock/transcript.json`)
  const data = await res.json()
  setTranscript(data)
}

defineExpose({
  loadTranscript
})
</script>
