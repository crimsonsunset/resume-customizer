<script>
  export let basicInfo = {}

  /**
   * Formats contact information for display
   */
  function getContactInfo(basicInfo) {
    const contact = basicInfo.contact || {}
    return {
      name: basicInfo.name || '',
      email: contact.email || '',
      address: contact.address || '',
      phone: contact.phone || ''
    }
  }

  $: contactInfo = getContactInfo(basicInfo)
</script>

<header class="header">
  <h1>{contactInfo.name}</h1>
  {#if contactInfo.email}
    <p>{contactInfo.email}</p>
  {/if}
  {#if contactInfo.address}
    <p>{contactInfo.address}</p>
  {/if}
  {#if contactInfo.phone}
    <p>{contactInfo.phone}</p>
  {/if}
</header> 