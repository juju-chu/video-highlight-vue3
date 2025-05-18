<template>
  <div
    class="p-4 bg-gray-100"
  >
    <h2
      class="text-xl font-bold mb-4"
    >
      Transcript
    </h2>
    <div
      v-for="(item, index) in transcript"
      :key="item.id"
      class="mb-2"
    >
      <!-- 只在 title 第一次出現時顯示 -->
      <div
        v-if="index === 0 || item.title !== transcript[index - 1].title"
        class="text-lg font-semibold text-gray-700 mb-1"
      >
        {{ item.title }}
      </div>
      <div
        class="flex gap-2 items-center p-2 rounded"
        :class="{
          'bg-white': !item.highlight,
          'bg-[#3c82f6] text-white': item.highlight,
          'border-2 border-[#facc14]': item.highlight && (props.currentTime >= item.start && props.currentTime <= item.end)
        }"
      >
        <div
          class="text-sm font-bold"
          :class="{
            'cursor-not-allowed text-[#2b67ec]': !item.highlight,
            'cursor-pointer text-white hover:text-gray-700': item.highlight
          }"
          @click="item.highlight && handleTimestampClick(item)"
        >
          {{ formatTime(item.start) }} {{ item.section }}
        </div>
        <div
          class="cursor-pointer"
          @click="handleTextClick(item)"
        >
          {{ item.text }}
        </div>
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

// 格式化時間函數
function formatTime(seconds: number): string {
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
