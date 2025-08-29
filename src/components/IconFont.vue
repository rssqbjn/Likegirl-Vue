<template>
  <svg class="icon-font" :class="className" aria-hidden="true">
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.icon-font {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>