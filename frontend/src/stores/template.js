import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref([])
  const currentTemplate = ref(null)
  const loading = ref(false)

  async function fetchTemplates() {
    loading.value = true
    try {
      const response = await api.get('/templates')
      templates.value = response.data
    } catch (error) {
      console.error('Error fetching templates:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchTemplate(id) {
    loading.value = true
    try {
      const response = await api.get(`/templates/${id}`)
      currentTemplate.value = response.data
      return response.data
    } catch (error) {
      console.error('Error fetching template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(formData) {
    loading.value = true
    try {
      const response = await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      templates.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateTemplate(id, data) {
    loading.value = true
    try {
      const response = await api.put(`/templates/${id}`, data)
      const index = templates.value.findIndex(t => t._id === id)
      if (index !== -1) {
        templates.value[index] = response.data
      }
      if (currentTemplate.value?._id === id) {
        currentTemplate.value = response.data
      }
      return response.data
    } catch (error) {
      console.error('Error updating template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteTemplate(id) {
    loading.value = true
    try {
      await api.delete(`/templates/${id}`)
      templates.value = templates.value.filter(t => t._id !== id)
      if (currentTemplate.value?._id === id) {
        currentTemplate.value = null
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function generateHtml(id) {
    try {
      const response = await api.post(`/templates/${id}/generate-html`)
      return response.data.html
    } catch (error) {
      console.error('Error generating HTML:', error)
      throw error
    }
  }

  async function processOcr(id) {
    try {
      const response = await api.post(`/templates/${id}/process-ocr`)
      return response.data.detectedTexts
    } catch (error) {
      console.error('Error processing OCR:', error)
      throw error
    }
  }

  async function detectElements(id) {
    try {
      const response = await api.post(`/templates/${id}/detect-elements`)
      return response.data.detectedButtons
    } catch (error) {
      console.error('Error detecting elements:', error)
      throw error
    }
  }

  return {
    templates,
    currentTemplate,
    loading,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    generateHtml,
    processOcr,
    detectElements
  }
})
