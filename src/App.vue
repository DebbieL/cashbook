<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
  html, body, #app {
    box-sizing: border-box;
    padding: 0;
    margin: 0; 
    height: 100vh;
  }
</style>
