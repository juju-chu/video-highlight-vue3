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
        :class="{
          'bg-blue-100': selectedIds.has(item.id),
          'bg-yellow-200': props.currentTime >= item.start && props.currentTime <= item.end
        }"
        @click="handleItemClick(item)"
      >
        {{ item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineOptions, defineEmits, defineProps, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranscriptStore } from '../store'

defineOptions({
  name: 'TranscriptEditor'
})

const props = defineProps<{
  currentTime: number
}>()

const emit = defineEmits(['seek'])

const store = useTranscriptStore()
const { transcript, selectedIds } = storeToRefs(store)
const { toggleSelect, setTranscript } = store

// 當點擊文字時，發送 seek 事件並帶上開始時間
const handleItemClick = (item: any) => {
  toggleSelect(item.id)
  emit('seek', item.start)
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
