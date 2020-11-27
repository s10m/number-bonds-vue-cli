<template>
  <h1>
    <canvas id="gameCanvas" height="300" width="300"></canvas>
  </h1>
</template>

<script>
import { onMounted } from "vue";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  setup() {
    onMounted(() => {
      initialise();
    });
    /**
     * @returns {HTMLCanvasElement}
     */
    function getCanvas() {
      return document.getElementById("gameCanvas");
    }
    function initialise() {
      const theCanvas = getCanvas();
      const theContext = theCanvas.getContext("2d");
      theContext.arc(150, 150, 25, 0, 2 * Math.PI);
      theContext.fill();
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
