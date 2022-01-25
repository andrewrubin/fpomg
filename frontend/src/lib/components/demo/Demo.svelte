<script>
  const placeholder = "fpomg.com/600/400";
</script>

<section class="demo">
  <div class="row">
    <div class="col col--6 col--lrg-5">
      <div class="playground">
        <label for="tryit">
          <span class="block txt-body-jumbo">try it:</span>
        </label>
        <input type="text" id="tryit" placeholder={placeholder} />
      </div>
    </div>
    <div class="col col--6 col--lrg-5">
      <img class="result block fit" src="https://fpomg.com/600/400" alt="FPO" />
    </div>
  </div>
</section>

<style lang="scss">
  .demo {
    --corners: 16px;

    background-color: var(--color-dark-400);
    padding: 140px 0 125px;
  }

  .playground {
    background-color: var(--color-dark-300);
    border: 1px solid var(--color-dark-100);
    border-radius: var(--corners);
  }

  .result {
    border-radius: var(--corners);
  }
</style>