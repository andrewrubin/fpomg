<script>
  export let color;
</script>

<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
  <path
    stroke={color || "currentColor"}
    stroke-miterlimit="10"
    stroke-width="2"
    fill="none"
    d="M10.38,7.07h6.68V2.89a1.44,1.44,0,0,0-1.44-1.44H4.76A1.44,1.44,0,0,0,3.32,2.89v14.6a1.44,1.44,0,0,0,1.44,1.44H8.94V8.51A1.44,1.44,0,0,1,10.38,7.07Z"
  />
  <path
    stroke={color || "currentColor"}
    stroke-miterlimit="10"
    stroke-width="2"
    fill="none"
    d="M8.94,18.93v4.18a1.44,1.44,0,0,0,1.44,1.44H21.24a1.44,1.44,0,0,0,1.44-1.44V8.51a1.44,1.44,0,0,0-1.44-1.44H17.06" 
  />
</svg>

<style>
  .copy-icon {
    height: 1.2em;
    width: 1.2em;
  }
</style>