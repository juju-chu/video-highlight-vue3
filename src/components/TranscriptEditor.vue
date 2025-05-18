<template>
  <div
    class="min-h-full p-2 sm:p-4 bg-gray-100"
  >
    <h2
      class="text-base sm:text-xl font-bold mb-4 sticky top-0 bg-gray-100 py-2 z-10"
    >
      Transcript
    </h2>
    <div
      v-for="(item, index) in transcript"
      :key="item.id"
      class="mb-1 sm:mb-2"
    >
      <!-- 只在 title 第一次出現時顯示 -->
      <div
        v-if="index === 0 || item.title !== transcript[index - 1].title"
        class="text-base sm:text-lg font-semibold text-gray-700 mb-1"
      >
        {{ item.title }}
      </div>
      <div
        class="flex flex-col sm:flex-row gap-1 sm:gap-2 p-2 rounded text-sm sm:text-base"
        :class="{
          'bg-white': !item.highlight,
          'bg-[#3c82f6] text-white': item.highlight,
          'border-2 border-[#facc14]': item.highlight && (props.currentTime >= item.start && props.currentTime <= item.end)
        }"
        :data-time="item.start"
      >
        <div
          class="font-bold whitespace-nowrap text-xs sm:text-sm"
          :class="{
            'cursor-not-allowed text-[#2b67ec]': !item.highlight,
            'cursor-pointer text-white hover:text-gray-700': item.highlight
          }"
          @click="item.highlight && handleTimestampClick(item)"
        >
          {{ formatTime(item.start) }} {{ item.section }}
        </div>
        <div
          class="cursor-pointer flex-1"
          @click="handleTextClick(item)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
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

// 當前高亮的字幕元素的 ref
const currentItemRef = ref<HTMLElement | null>(null)

// 監聽播放時間變化，自動滾動到當前播放的字幕
watch(() => props.currentTime, (time) => {
  // 找到當前時間對應的字幕
  const currentItem = transcript.value.find(
    item => time >= item.start && time <= item.end
  )

  // 如果找到對應字幕
  if (currentItem) {
    // 找到對應的 DOM 元素
    const itemElement = document.querySelector(`[data-time="${currentItem.start}"]`)
    if (itemElement) {
      // 使用平滑滾動效果滾動到該元素
      itemElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
})

// 格式化時間函數
function formatTime(seconds: number): string {
  if (!seconds) return '00:00'
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
