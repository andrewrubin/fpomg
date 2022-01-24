<script>
  import { assets } from "$app/paths";
  import CopyField from "../copy-field/CopyField.svelte"

  let examples = [
    { label: "basic", url: "fpomg.com/600/400" },
    { label: "custom color", url: "fpomg.com/600/400/9932cc" },
    { label: "custom text", url: "fpomg.com/600/400/?text=santa" },
  ];
</script>

<div class="intro">
  <header class="wrapper">
    <h1>
      <img src={`${assets}/logo-fpomg.svg`} alt="FPOMG" />
      <span class="txt-body-larger">the URL-based FPO image generator</span>
    </h1>
  </header>

  <div class="examples">
    <ul class="row examples__list">
      {#each examples as example}
        <li class="col col--4 examples__item">
          <span class="example__label txt-body-larger">{example.label}</span>
          <CopyField url={example.url} />
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="scss">
  @use "../../styles/helpers" as h;
  
  .intro {
    display: flex;
    flex-direction: column;
    height: max(100vh, 500px);
    justify-content: center;
  }

  header {
    margin-bottom: auto;
    margin-top: auto;
    text-align: center;
    width: 100%;
  }

  img {
    display: block;
    margin: auto;
    width: min(80%, 500px);
  }

  .examples {
    background-color: var(--color-dark-200);
  }

  .examples__list {
    list-style-type: none;
  }

  .example__label {
    padding-left: h.space-by(3);
  }
</style>