<template>
  <footer class="admin-footer">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6">
          <div class="text-center text-md-start">
            <p class="mb-0">
              © {{ currentYear }} 
              <a href="#" class="text-decoration-none">Like Girl</a>
              - 用心记录我们的爱情故事
            </p>
          </div>
        </div>
        <div class="col-md-6">
          <div class="text-center text-md-end">
            <p class="mb-0">
              <i class="fas fa-heart text-danger"></i>
              Made with Love
              <i class="fas fa-heart text-danger"></i>
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AdminFooter',
  setup() {
    const currentYear = computed(() => new Date().getFullYear())

    return {
      currentYear
    }
  }
}
</script>

<style scoped>
.admin-footer {
  background-color: #fff;
  border-top: 1px solid #e3e6f0;
  padding: 1rem 0;
  margin-top: auto;
  box-shadow: 0 -2px 4px rgba(0,0,0,.05);
  flex-shrink: 0;
}

.admin-footer p {
  color: #5a5c69;
  font-size: 0.875rem;
  line-height: 1.5;
}

.admin-footer a {
  color: #4e73df;
  font-weight: 500;
}

.admin-footer a:hover {
  color: #2653d4;
}

.text-danger {
  color: #e74a3b !important;
}

.text-decoration-none {
  text-decoration: none !important;
}

.mb-0 {
  margin-bottom: 0 !important;
}

.text-center {
  text-align: center !important;
}

.text-md-start {
  text-align: left !important;
}

.text-md-end {
  text-align: right !important;
}

@media (max-width: 767.98px) {
  .text-md-start,
  .text-md-end {
    text-align: center !important;
  }
  
  .admin-footer .col-md-6:first-child {
    margin-bottom: 0.5rem;
  }
}

/* 动画效果 */
.admin-footer {
  transition: all 0.3s ease;
}

.admin-footer a {
  transition: color 0.3s ease;
}

.fas.fa-heart {
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.1);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1);
  }
}
</style>