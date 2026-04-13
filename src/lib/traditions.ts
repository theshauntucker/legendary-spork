export interface IntroductionLink {
  label: string;
  url: string;
  description?: string;
}

export interface Tradition {
  slug: string;
  name: string;
  alternateNames?: string[];
  summary: string;
  adherentCount?: string;
  foundedDate?: string;
  overviewHtml: string;
  introductionLinks: IntroductionLink[];
  accentColor: string;
}

const traditions: Tradition[] = [
  {
    slug: "christianity",
    name: "Christianity",
    alternateNames: ["The Christian Faith"],
    summary:
      "The world's largest faith tradition, centered on the life and teachings of Jesus of Nazareth. Encompasses Catholic, Orthodox, Protestant, and Evangelical branches.",
    adherentCount: "~2.4 billion",
    foundedDate: "1st century CE",
    overviewHtml:
      "<p>Christianity is a monotheistic Abrahamic religion based on the life and teachings of Jesus Christ. With approximately 2.4 billion adherents, it is the world's largest religion.</p><p>Christianity encompasses an extraordinary diversity of belief and practice, from Roman Catholicism and Eastern Orthodoxy to mainline Protestantism, Evangelical movements, Pentecostalism, and thousands of independent churches worldwide. Major theological questions — the nature of salvation, the authority of scripture, the role of tradition, and the structure of church leadership — have produced distinct denominations with significantly different practices and beliefs.</p><p>The tradition's central texts are the Old and New Testaments of the Bible, though different branches recognize different canons. Core beliefs typically include the divinity of Jesus, the Trinity, salvation through grace, and the resurrection. Practices range from elaborate liturgical worship to informal contemporary services, from monasticism to megachurch culture.</p>",
    introductionLinks: [
      { label: "Christianity.com", url: "https://www.christianity.com", description: "A broad overview from a Christian perspective." },
      { label: "Bible Gateway", url: "https://www.biblegateway.com", description: "Read the Bible in dozens of translations." },
    ],
    accentColor: "#1e40af",
  },
  {
    slug: "mormonism",
    name: "Latter-day Saints",
    alternateNames: ["LDS", "Mormonism", "The Church of Jesus Christ of Latter-day Saints"],
    summary:
      "A restoration movement founded by Joseph Smith in 1830, centered on the Book of Mormon and continuing prophetic revelation.",
    adherentCount: "~17 million",
    foundedDate: "1830",
    overviewHtml:
      "<p>The Church of Jesus Christ of Latter-day Saints (LDS Church) is a restorationist Christian movement founded by Joseph Smith in upstate New York in 1830. Members believe that Smith was called as a prophet to restore the original church established by Jesus Christ, and that the Book of Mormon is a companion scripture to the Bible.</p><p>The LDS Church is one of the fastest-growing religious movements in modern history. Distinctive beliefs include continuing prophetic revelation through a living prophet, temple ordinances including baptism for the dead and celestial marriage, a lay priesthood, and the Word of Wisdom health code. The Church operates one of the world's largest missionary programs, with approximately 50,000 full-time missionaries serving at any given time.</p><p>The tradition has generated significant scholarly and public interest regarding its historical claims, including the translation of the Book of Mormon, the historicity of the Book of Abraham, polygamy in early Church history, and the evolution of temple ceremonies. Both devoted members and those who have left the Church have created extensive resources exploring these topics from their respective perspectives.</p>",
    introductionLinks: [
      { label: "ChurchofJesusChrist.org", url: "https://www.churchofjesuschrist.org", description: "Official Church website." },
      { label: "Come Unto Christ", url: "https://www.churchofjesuschrist.org/comeuntochrist", description: "Schedule a visit with missionaries." },
      { label: "Gospel Topics Essays", url: "https://www.churchofjesuschrist.org/study/manual/gospel-topics-essays", description: "Official essays on sensitive historical topics." },
    ],
    accentColor: "#0369a1",
  },
  {
    slug: "islam",
    name: "Islam",
    alternateNames: ["The Muslim Faith"],
    summary:
      "A major world religion founded in the 7th century, centered on the Quran and the teachings of Prophet Muhammad. Encompasses Sunni, Shia, and Sufi traditions.",
    adherentCount: "~1.9 billion",
    foundedDate: "7th century CE",
    overviewHtml:
      "<p>Islam is a monotheistic Abrahamic religion teaching that Muhammad is the last messenger of God (Allah). Its central text is the Quran, believed by Muslims to be the literal word of God as revealed to Muhammad through the angel Gabriel.</p><p>The Five Pillars of Islam form the foundation of Muslim life: the shahada (declaration of faith), salah (five daily prayers), zakat (charitable giving), sawm (fasting during Ramadan), and hajj (pilgrimage to Mecca). These practices unite the global Muslim community (ummah) across diverse cultural contexts.</p><p>Islam's major branches — Sunni (approximately 85-90% of Muslims) and Shia (10-15%) — differ primarily on questions of religious authority and succession after Muhammad's death. Sufi traditions, which emphasize mystical experience and spiritual closeness to God, exist within both branches. Islamic scholarship spans theology, law (sharia), philosophy, science, and art, representing one of the world's richest intellectual traditions.</p>",
    introductionLinks: [
      { label: "IslamicFinder", url: "https://www.islamicfinder.org", description: "Resources for learning about Islamic practices." },
      { label: "Quran.com", url: "https://quran.com", description: "Read the Quran with translations." },
    ],
    accentColor: "#047857",
  },
  {
    slug: "judaism",
    name: "Judaism",
    summary:
      "One of the oldest monotheistic traditions, with roots stretching back over three millennia. Encompasses Orthodox, Conservative, Reform, and Reconstructionist movements.",
    adherentCount: "~15 million",
    foundedDate: "~2000 BCE",
    overviewHtml:
      "<p>Judaism is one of the oldest monotheistic religions, originating in the Middle East over 3,500 years ago. Its foundational texts include the Torah (the first five books of the Hebrew Bible), the Talmud (rabbinic commentary and law), and centuries of scholarly interpretation.</p><p>Modern Judaism encompasses several major movements: Orthodox Judaism (which maintains strict adherence to traditional law and practice), Conservative Judaism (which balances tradition with modern adaptation), Reform Judaism (which emphasizes ethical principles and personal autonomy), and Reconstructionist Judaism (which views Judaism as an evolving civilization). Ultra-Orthodox (Haredi) communities maintain particularly distinctive practices and often live in relatively closed communities.</p><p>Jewish life centers on Shabbat observance, dietary laws (kashrut), lifecycle rituals, and study of sacred texts. The tradition's emphasis on questioning, debate, and interpretation — exemplified by the Talmudic tradition — has produced a remarkably rich intellectual culture spanning philosophy, law, mysticism (Kabbalah), and ethics.</p>",
    introductionLinks: [
      { label: "My Jewish Learning", url: "https://www.myjewishlearning.com", description: "Comprehensive resource for Jewish life and practice." },
    ],
    accentColor: "#b45309",
  },
  {
    slug: "hinduism",
    name: "Hinduism",
    alternateNames: ["Sanatan Dharma"],
    summary:
      "An ancient and extraordinarily diverse family of traditions originating in South Asia, encompassing a vast range of philosophies, practices, and devotional paths.",
    adherentCount: "~1.2 billion",
    foundedDate: "~1500 BCE",
    overviewHtml:
      "<p>Hinduism is a diverse body of religion, philosophy, and cultural practice native to the Indian subcontinent. Unlike most world religions, Hinduism has no single founder, no single scripture, and no commonly agreed set of teachings. It is often described as a family of traditions rather than a single religion.</p><p>Hindu traditions share certain core concepts: dharma (ethical duty), karma (the moral law of cause and effect), samsara (the cycle of death and rebirth), and moksha (liberation from this cycle). Major devotional paths include Vaishnavism (devotion to Vishnu), Shaivism (devotion to Shiva), and Shaktism (devotion to the Divine Mother). Philosophical schools range from strict monism (Advaita Vedanta) to dualism (Dvaita) to devotional theism (Bhakti).</p><p>Sacred texts include the Vedas, Upanishads, Bhagavad Gita, and the great epics (Mahabharata and Ramayana). Hindu practice encompasses temple worship (puja), yoga, meditation, pilgrimage, festivals, and elaborate ritual traditions. Some Hindu-derived movements, particularly those that have attracted Western followers, have faced scrutiny regarding guru dynamics and organizational control.</p>",
    introductionLinks: [
      { label: "Hindu American Foundation", url: "https://www.hinduamerican.org", description: "Resources on Hindu beliefs and practices." },
    ],
    accentColor: "#c2410c",
  },
  {
    slug: "buddhism",
    name: "Buddhism",
    summary:
      "A tradition founded by Siddhartha Gautama, emphasizing mindfulness, ethical conduct, and the pursuit of enlightenment. Encompasses Theravada, Mahayana, and Vajrayana branches.",
    adherentCount: "~500 million",
    foundedDate: "~5th century BCE",
    overviewHtml:
      "<p>Buddhism encompasses a variety of traditions, beliefs, and spiritual practices based on the teachings of Siddhartha Gautama (the Buddha), who lived in ancient India approximately 2,500 years ago. The Buddha's core teaching centers on the Four Noble Truths — the nature of suffering (dukkha), its cause, its cessation, and the path to its end.</p><p>Three major branches have developed: Theravada Buddhism (predominant in Southeast Asia), Mahayana Buddhism (predominant in East Asia), and Vajrayana Buddhism (predominant in Tibet and Mongolia). Each offers distinctive practices, philosophical frameworks, and paths to enlightenment. Common practices include meditation, mindfulness, ethical conduct, study of sutras, and monastic life.</p><p>In the modern era, Buddhism has attracted significant Western interest, particularly through meditation practices and mindfulness. Some Buddhist organizations, particularly certain Tibetan and Zen centers, have faced scrutiny regarding teacher misconduct, power dynamics, and institutional accountability — issues the broader Buddhist community continues to address.</p>",
    introductionLinks: [
      { label: "Access to Insight", url: "https://www.accesstoinsight.org", description: "Theravada Buddhist texts and teachings." },
      { label: "Lion's Roar", url: "https://www.lionsroar.com", description: "Buddhist news, teachings, and practices." },
    ],
    accentColor: "#92400e",
  },
  {
    slug: "sikhism",
    name: "Sikhism",
    summary:
      "A monotheistic tradition founded by Guru Nanak in the Punjab region, emphasizing equality, selfless service, and devotion to one God.",
    adherentCount: "~30 million",
    foundedDate: "15th century CE",
    overviewHtml:
      "<p>Sikhism is a monotheistic religion that originated in the Punjab region of South Asia in the 15th century CE. Founded by Guru Nanak Dev Ji and shaped by nine successive Gurus, Sikhism's central scripture is the Guru Granth Sahib, which holds the status of the eternal living Guru.</p><p>Core Sikh principles include belief in one God (Ik Onkar), equality of all people regardless of caste or gender, honest living (Kirat Karni), sharing with others (Vand Chakna), and selfless service (Seva). The tradition emphasizes both spiritual devotion and active engagement with the world. The langar (community kitchen) tradition, where free meals are served to all visitors regardless of background, embodies Sikh values of equality and service.</p><p>The Khalsa, established by the tenth Guru (Guru Gobind Singh Ji), represents the community of initiated Sikhs who maintain the five articles of faith (the Five Ks). Sikhism has a complex history involving persecution, military resistance, and the establishment of Sikh political sovereignty.</p>",
    introductionLinks: [
      { label: "SikhNet", url: "https://www.sikhnet.com", description: "Comprehensive Sikh resources and community." },
    ],
    accentColor: "#1e3a5f",
  },
  {
    slug: "jehovahs-witnesses",
    name: "Jehovah's Witnesses",
    alternateNames: ["JW", "Watchtower"],
    summary:
      "A Christian denomination known for door-to-door evangelism, distinctive theology, and a close-knit organizational structure governed by the Watchtower Society.",
    adherentCount: "~8.7 million",
    foundedDate: "1870s",
    overviewHtml:
      "<p>Jehovah's Witnesses are a Christian denomination founded in the 1870s by Charles Taze Russell, now governed by a Governing Body headquartered in Warwick, New York. The organization publishes extensively through the Watchtower Bible and Tract Society, and members are widely recognized for their door-to-door evangelism and distribution of publications including The Watchtower and Awake! magazines.</p><p>Distinctive beliefs include the use of God's name \"Jehovah,\" rejection of the Trinity doctrine, belief that only 144,000 will rule in heaven while the remainder of the faithful will live on a paradise earth, refusal of blood transfusions, and political neutrality including non-participation in military service and elections. Members celebrate the Memorial of Christ's death but do not observe birthdays, Christmas, or other holidays.</p><p>The organization has attracted significant attention regarding its disfellowshipping (shunning) practices, handling of child sexual abuse allegations, failed end-times predictions, and policies on blood transfusions. Both devoted members and those who have left have produced extensive resources examining these issues from their respective perspectives.</p>",
    introductionLinks: [
      { label: "JW.org", url: "https://www.jw.org", description: "Official Jehovah's Witnesses website." },
    ],
    accentColor: "#7c3aed",
  },
  {
    slug: "scientology",
    name: "Scientology",
    alternateNames: ["Church of Scientology", "CoS"],
    summary:
      "A set of beliefs and practices created by L. Ron Hubbard in 1954, centered on spiritual rehabilitation through auditing and study of Hubbard's writings.",
    adherentCount: "Estimates vary widely",
    foundedDate: "1954",
    overviewHtml:
      "<p>Scientology is a body of beliefs and practices created by American author L. Ron Hubbard in 1954. The Church of Scientology, headquartered in Clearwater, Florida, describes itself as a religion that offers a precise path to complete spiritual freedom. Its practices center on auditing (a form of spiritual counseling using an E-meter device) and study of Hubbard's extensive writings and lectures.</p><p>Scientology's belief system includes the concept of the thetan (the spiritual being), the reactive mind (source of negative experiences), and the goal of becoming \"Clear\" (free from the reactive mind). Advanced levels reveal Scientology's cosmological teachings, including the story of Xenu. The Church operates through a complex organizational structure including the Sea Organization, Celebrity Centres, and the Office of Special Affairs.</p><p>Scientology has been among the most publicly scrutinized religious movements in the modern era. Documentaries, books, investigative journalism, and testimony from former high-ranking members have examined the organization's practices around disconnection, financial demands, treatment of staff, legal strategies, and tax-exempt status. The Church vigorously disputes these characterizations.</p>",
    introductionLinks: [
      { label: "Scientology.org", url: "https://www.scientology.org", description: "Official Church of Scientology website." },
    ],
    accentColor: "#059669",
  },
  {
    slug: "cults",
    name: "Cults & New Religions",
    alternateNames: ["New Religious Movements", "NRMs", "High-Control Groups"],
    summary:
      "Independent movements and organizations that scholars and former members have identified as exhibiting high-control group dynamics.",
    adherentCount: "Varies",
    foundedDate: "Various",
    overviewHtml:
      "<p>This section covers religious and quasi-religious movements that don't fit neatly within the major world traditions, as well as groups that scholars, psychologists, and former members have identified as exhibiting high-control dynamics. The academic study of these movements — known as new religious movement (NRM) studies — is a growing field that examines group dynamics, recruitment, retention, and exit experiences.</p><p>Groups covered include historical movements like Peoples Temple (Jonestown), Heaven's Gate, and the Branch Davidians, as well as contemporary organizations like NXIVM, Twin Flames Universe, and various self-improvement and coaching organizations that have been described as exhibiting cult-like dynamics. The section also covers movements like QAnon that, while not traditionally religious, exhibit many characteristics studied by cult researchers.</p><p>Resources in this section draw from academic research, survivor testimony, legal proceedings, investigative journalism, and the work of experts like Steven Hassan (BITE Model), Robert Lifton, and Margaret Singer. The goal is to provide accessible information about group dynamics and undue influence for educational purposes.</p>",
    introductionLinks: [
      { label: "Freedom of Mind", url: "https://freedomofmind.com", description: "Steven Hassan's organization on undue influence." },
      { label: "ICSA", url: "https://www.icsahome.com", description: "International Cultic Studies Association." },
    ],
    accentColor: "#dc2626",
  },
  {
    slug: "general",
    name: "General Resources",
    alternateNames: ["Cross-Tradition", "Recovery"],
    summary:
      "Resources that span multiple traditions: recovery support, psychology of belief, academic study of religion, and tools for understanding group dynamics.",
    adherentCount: undefined,
    foundedDate: undefined,
    overviewHtml:
      "<p>This section collects resources that are not specific to any single religious tradition but address the broader themes of faith, doubt, recovery, and the psychology of belief. These cross-cutting resources serve people across all traditions and at all stages of their spiritual journey.</p><p>Topics include religious trauma and recovery (including Dr. Marlene Winell's work on Religious Trauma Syndrome), the psychology of belief and deconversion, secular ethics and meaning-making, support organizations like Recovering from Religion and The Clergy Project, academic study of religion, and general resources on critical thinking, cognitive biases, and the neuroscience of belief.</p><p>Whether you are deepening your faith, exploring questions, navigating a transition, or supporting someone who is — these resources provide frameworks, community, and professional support that transcend any single tradition.</p>",
    introductionLinks: [
      { label: "Recovering from Religion", url: "https://www.recoveringfromreligion.org", description: "Secular support for people navigating religious doubt." },
      { label: "The Clergy Project", url: "https://clergyproject.org", description: "Support network for clergy who no longer believe." },
    ],
    accentColor: "#6b7280",
  },
];

export function getAllTraditions(): Tradition[] {
  return traditions;
}

export function getTraditionBySlug(slug: string): Tradition | undefined {
  return traditions.find((t) => t.slug === slug);
}

export function getAllTraditionSlugs(): string[] {
  return traditions.map((t) => t.slug);
}
