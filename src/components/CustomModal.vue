<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="modal-close" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="type === 'success'" class="modal-icon success">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        </div>
        
        <div v-if="type === 'error'" class="modal-icon error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        
        <div v-if="type === 'warning'" class="modal-icon warning">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
          </svg>
        </div>
        
        <div v-if="type === 'confirm'" class="modal-icon confirm">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9,12l2,2 4-4"></path>
          </svg>
        </div>
        
        <p class="modal-message">{{ message }}</p>
      </div>
      
      <div class="modal-footer">
        <button 
          class="modal-btn"
          :class="{
            'modal-btn-success': type === 'success',
            'modal-btn-error': type === 'error',
            'modal-btn-warning': type === 'warning',
            'modal-btn-primary': type === 'confirm'
          }"
          @click="handleConfirm"
        >
          {{ type === 'confirm' ? '确认' : '确定' }}
        </button>
        <button v-if="type === 'confirm'" class="modal-btn modal-btn-secondary" @click="handleCancel">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success', // success, error, warning, confirm
      validator: value => ['success', 'error', 'warning', 'confirm'].includes(value)
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close()
      }
    },
    handleConfirm() {
      this.$emit('confirm')
      this.close()
    },
    handleCancel() {
      this.$emit('cancel')
      this.close()
    }
  }
}
</script>

<style scoped>
@import '@/styles/modal.css';
</style>
