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
      phone: contact.phone || '',
      linkedin: contact.linkedin || '',
      github: contact.github || '',
      resume: contact.resume || ''
    }
  }

  /**
   * Creates the links array with display text and URLs
   */
  function getLinks(contactInfo) {
    const links = []
    if (contactInfo.linkedin) {
      links.push({
        text: contactInfo.linkedin,
        url: `https://${contactInfo.linkedin}`
      })
    }
    if (contactInfo.github) {
      links.push({
        text: contactInfo.github,
        url: `https://${contactInfo.github}`
      })
    }
    if (contactInfo.resume) {
      links.push({
        text: contactInfo.resume,
        url: `https://${contactInfo.resume}`
      })
    }
    return links
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
  {#if getLinks(contactInfo).length > 0}
    <p class="links">
      {#each getLinks(contactInfo) as link, index}
        <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>{#if index < getLinks(contactInfo).length - 1}<span class="separator"> | </span>{/if}
      {/each}
    </p>
  {/if}
</header>
