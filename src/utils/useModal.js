import { ref } from 'vue'

const modalState = ref({
  visible: false,
  title: '提示',
  message: '',
  type: 'success',
  resolve: null,
  reject: null
})

export function useModal() {
  const showModal = (options) => {
    return new Promise((resolve, reject) => {
      modalState.value = {
        visible: true,
        title: options.title || '提示',
        message: options.message || '',
        type: options.type || 'success',
        resolve,
        reject
      }
    })
  }

  const showSuccess = (message, title = '成功') => {
    return showModal({ message, title, type: 'success' })
  }

  const showError = (message, title = '错误') => {
    return showModal({ message, title, type: 'error' })
  }

  const showWarning = (message, title = '警告') => {
    return showModal({ message, title, type: 'warning' })
  }

  const showConfirm = (message, title = '确认') => {
    return showModal({ message, title, type: 'confirm' })
  }

  const closeModal = () => {
    modalState.value.visible = false
    if (modalState.value.reject) {
      modalState.value.reject(new Error('Modal closed'))
    }
  }

  const confirmModal = () => {
    modalState.value.visible = false
    if (modalState.value.resolve) {
      modalState.value.resolve(true)
    }
  }

  const cancelModal = () => {
    modalState.value.visible = false
    if (modalState.value.reject) {
      modalState.value.reject(new Error('User cancelled'))
    }
  }

  return {
    modalState,
    showSuccess,
    showError,
    showWarning,
    showConfirm,
    closeModal,
    confirmModal,
    cancelModal
  }
}