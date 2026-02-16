<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-20">
      <div class="text-center text-white">
        <h1 class="text-5xl md:text-6xl font-bold mb-6">
          Email Marketing <br/>Feito Simples
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-blue-100">
          Transforme designs de imagens em templates HTML responsivos para email marketing
        </p>
        <div class="flex justify-center space-x-4">
          <router-link 
            to="/register" 
            class="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Começar Grátis
          </router-link>
          <router-link 
            to="/login" 
            class="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Fazer Login
          </router-link>
        </div>
      </div>

      <!-- Features -->
      <div class="grid md:grid-cols-3 gap-8 mt-20">
        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Upload de Imagens</h3>
          <p class="text-blue-100">Envie seu design em formato de imagem e transforme em HTML</p>
        </div>

        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">Editor Visual</h3>
          <p class="text-blue-100">Selecione áreas e edite elementos com interface intuitiva</p>
        </div>

        <div class="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-white">
          <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-2">HTML Responsivo</h3>
          <p class="text-blue-100">Código otimizado para todos os clientes de email</p>
        </div>
      </div>

      <!-- Additional Features -->
      <div class="mt-20 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 text-white">
        <h2 class="text-3xl font-bold mb-8 text-center">Recursos Avançados</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-green-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <div>
              <h4 class="font-semibold">OCR - Detecção de Texto</h4>
              <p class="text-blue-100 text-sm">Extrai automaticamente textos da imagem</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-green-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <div>
              <h4 class="font-semibold">Detecção de Botões</h4>
              <p class="text-blue-100 text-sm">Identifica automaticamente call-to-actions</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-green-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <div>
              <h4 class="font-semibold">Editor de Código</h4>
              <p class="text-blue-100 text-sm">Visualize e edite o HTML gerado</p>
            </div>
          </div>
          <div class="flex items-start space-x-3">
            <svg class="w-6 h-6 text-green-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <div>
              <h4 class="font-semibold">Sistema de Templates</h4>
              <p class="text-blue-100 text-sm">Salve e reutilize seus templates</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="border-t border-white border-opacity-20 py-8">
      <div class="container mx-auto px-4 text-center text-white text-sm">
        <p>&copy; 2025 Email Marketing SaaS. Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Home page component
</script>
