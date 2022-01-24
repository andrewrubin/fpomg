<script>
  import CopyIcon from "../copy-icon/CopyIcon.svelte"

  export let url;
</script>

<span>
  <pre>{url}</pre>
  <button><CopyIcon /></button>
</span>

<style lang="scss">
  @use "../../styles/helpers" as h;

  span {
    background-color: var(--color-light-100);
    border-radius: 3em;
    color: var(--color-text-dark);
    display: flex;
    justify-content: space-between;
    line-height: 0.5;
    overflow: hidden;
    padding-left: h.space-by(3);
  }

  pre {
    line-break: anywhere;
  }

  button {
    color: var(--color-light-300);
    padding: h.space-by(1.5) h.space-by(3);
  }
</style>