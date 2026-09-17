export default {
  nav: {
    lastPolls: 'Last polls',
    createPoll: 'Create Poll',
    home: 'Home',
    lightMode: 'Light mode',
    darkMode: 'Dark mode'
  },
  home: {
    title: 'Quick and easy polls',
    subtitle: 'Create polls in seconds, share a link, and watch votes come in live.',
    createBtn: 'Create a Poll',
    features: {
      instant: { label: 'Instant creation', desc: 'No sign-up needed' },
      sharing: { label: 'Easy sharing', desc: 'One link to share' },
      results: { label: 'Real-time results', desc: 'Watch votes live' }
    }
  },
  create: {
    pageTitle: 'Create Poll',
    title: 'Create a Poll',
    subtitle: 'Add a title and at least two options to get started.',
    titleLabel: 'Title',
    optionLabel: 'Option {{n}}',
    addOption: 'Add Option',
    addImage: 'Add image',
    durationNote: 'Voting open for <b>{{min}} min</b> after creation.',
    createBtn: 'Create Poll',
    confirmTitle: 'Publish poll?',
    confirmBody: 'Once published it cannot be edited.',
    edit: 'Edit',
    publish: 'Publish',
    successTitle: 'Poll Created',
    successBody: 'Your poll is ready. Share it with others to start collecting votes.',
    close: 'Close',
    viewPoll: 'View Poll',
    errors: {
      titleMin: 'Title must be at least 3 characters',
      titleMax: 'Title must be at most 200 characters',
      optionEmpty: 'Option cannot be empty',
      duplicate: 'Duplicate option',
      fixErrors: 'Please fix the errors above',
      imageType: 'Only image files are allowed',
      imageSize: 'Image must be under 5MB',
      createFailed: 'Failed to create poll'
    }
  },
  poll: {
    voteOn: 'Vote on: {{title}}',
    by: 'by {{name}}',
    vote: 'Vote',
    closed: 'Poll closed',
    created: 'Created {{date}}'
  },
  share: {
    copyLink: 'Copy poll link',
    copyBars: 'Copy as bar chart',
    copyPie: 'Copy as pie chart',
    shareX: 'Share on X',
    shareWhatsApp: 'Share on WhatsApp',
    copied: 'link copied to clipboard',
    copiedEmbed: 'embed code copied to clipboard',
    voteText: 'Vote on this poll!',
    embedPoll: 'Embed poll'
  },
  time: {
    minLeft: '{{n}} min left',
    secLeft: '{{n}}s left',
    justNow: 'Just now',
    minsAgo: '{{n}}m ago',
    hoursAgo: '{{n}}h ago',
    voted: 'voted'
  },
  chart: {
    votes: 'votes',
    sortAsc: 'Sort ascending'
  },
  mock: {
    title: 'Best programming language?',
    images: 'Images'
  },
  error: {
    tryAgain: 'Try going back or refreshing the page.',
    goHome: 'Go home'
  },
  terms: {
    pageTitle: 'Terms of Service'
  },
  privacy: {
    pageTitle: 'Privacy Policy'
  },
  status: {
    up: 'Operational',
    down: 'Degraded',
    banner: 'Some services may be experiencing issues. We are working to resolve them.'
  },
  footer: {
    madeBy: 'Made by'
  },
  errors: {
    16: 'poll closed',
    17: 'failed to load poll',
    'permission-denied': "you don't have permission to do that",
    unavailable: 'service is temporarily unavailable, please try again',
    'not-found': 'the requested resource was not found',
    unauthenticated: 'authentication failed, please refresh the page'
  }
}
