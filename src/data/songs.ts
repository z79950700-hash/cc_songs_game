// ===== TYPE DEFINITIONS =====

export interface Song {
  id: number;
  title: string;
  album: string;
  year: number;
  color: string;
  coverUrl: string;
  lyricsExcerpt: string;
  backgroundStory: string;
  // Populated at runtime by prefetchAlbumArt
  dominantColor?: string;
}

export type Awards = Record<number, string[]>;

// ===== AWARDS DATA =====

export const AWARDS: Awards = {
   1: ["《后来的我们》(2018) 电影主题曲"],
   2: ["2008 北京流行音乐典礼 年度金曲"],
  13: ["中华音乐人交流协会 2004 年度十大单曲"],
  15: ["中华音乐人交流协会 2005 年度十大单曲"],
  24: ["《盛夏光年》(2006) 电影主题曲", "第43届金马奖 最佳原创电影歌曲提名"],
  27: ["第25届金曲奖 年度歌曲提名 (2014)", "2013 世界棒球经典赛台湾队指定曲"],
};

// ===== SONG DATA =====

export const SONGS: Song[] = [
  {
    id: 1, title: "后来的我们", album: "后来的我们 OST", year: 2018, color: "#c0392b",
    coverUrl: "",
    lyricsExcerpt: "后来的我们\n什么都有了\n却没有了我们\n后来终于在眼泪中\n明白\n有些人，一旦错过就不再",
    backgroundStory: "为电影《后来的我们》所作，上线首日破亿播放，是五月天迄今 Spotify 流量最高的单曲（约9400万），也是最多人在分手后单曲循环的一首歌。"
  },
  {
    id: 2, title: "突然好想你", album: "为爱而生", year: 2006, color: "#e67e22",
    coverUrl: "",
    lyricsExcerpt: "突然好想你\n那些日子的我们\n突然好想哭\n那么多往事\n不知从何说起",
    backgroundStory: "五月天 Spotify 全球第二高播放（约8700万），演唱会收视率最高的单曲。写的是忽然想起旧日好友的那种刺痛感，是离散世代台湾人的共同记忆。"
  },
  {
    id: 3, title: "我不愿让你一个人", album: "为爱而生", year: 2006, color: "#2980b9",
    coverUrl: "",
    lyricsExcerpt: "我不愿让你一个人\n流浪在深夜里\n我不愿让你一个人\n哭泣在无边黑暗里",
    backgroundStory: "怪兽创作，Spotify 约4700万次播放。旋律框架在一次深山团练中成形，是五月天最治愈的失恋歌曲，也是现场氛围最动人的大合唱之一。"
  },
  {
    id: 4, title: "温柔", album: "爱情万岁", year: 2000, color: "#2c3e50",
    coverUrl: "",
    lyricsExcerpt: "也许我\n没有什么才气\n写不出你\n心目中最美的诗句",
    backgroundStory: "Spotify 约2400万次播放。石头创作，bass-driven 情歌，旋律极简，被无数人在婚礼上深情演唱，是五月天被翻唱次数最多的作品之一。"
  },
  {
    id: 5, title: "任性", album: "派对动物", year: 2016, color: "#8e44ad",
    coverUrl: "",
    lyricsExcerpt: "就让我任性一次\n爱你不顾一切\n就算这世界\n要我放手",
    backgroundStory: "Spotify 约1900万次播放，为电视剧《难哄》主题曲，播出后流量暴增。是五月天近年跨圈最成功的单曲，打入不熟悉摇滚的受众群体。"
  },
  {
    id: 6, title: "拥抱", album: "人生海海", year: 2001, color: "#27ae60",
    coverUrl: "",
    lyricsExcerpt: "想就这样抱着你\n不放开\n爱能不能够\n永远单纯没有悲哀",
    backgroundStory: "Apple Music 台湾区长期热门，2001年发行至今仍是演唱会必唱安可曲。是五月天最早被大众记住的治愈系歌曲，无数人表白时播放过它。"
  },
  {
    id: 7, title: "因为你 所以我", album: "第二人生", year: 2011, color: "#d35400",
    coverUrl: "",
    lyricsExcerpt: "因为你\n所以我\n才能成为更好的自己\n谢谢你\n让我懂得了爱",
    backgroundStory: "Apple Music 热门榜前列，描写两个人互相成全的状态。与陈绮贞合唱版本流传更广，是五月天双主唱对唱中最受欢迎的一首。"
  },
  {
    id: 8, title: "好好", album: "自传", year: 2016, color: "#16a085",
    coverUrl: "",
    lyricsExcerpt: "好好 好好地\n比以往更乐观地\n好好 好好地\n代替我爱这个世界",
    backgroundStory: "献给离世歌迷的单曲，起因是一位罹癌女歌迷去世前留下心愿，阿信写完后连续三天无法入睡。Apple Music 长期榜上有名。"
  },
  {
    id: 9, title: "洋葱", album: "神的孩子都在跳舞", year: 2004, color: "#f39c12",
    coverUrl: "",
    lyricsExcerpt: "如果你愿意一层一层一层\n地剥开我的心\n你会发现\n你会讶异\n这里面有没有哪里住着你",
    backgroundStory: "Apple Music 热门 Top 10，是五月天最著名的爱情隐喻曲，「剥洋葱」意象深入人心，被选为无数综艺节目爱情相关环节的背景音乐。"
  },
  {
    id: 10, title: "干杯", album: "自传", year: 2016, color: "#d4a373",
    coverUrl: "",
    lyricsExcerpt: "我们从不一样\n到一样地\n望着同一个天空\n喝着同一口月光",
    backgroundStory: "Apple Music 热门 Top 10。写给旧朋友与老歌迷的一封信，《自传》专辑中 KTV 点唱率最稳定的单曲，温暖而不煽情，适合任何告别场景。"
  },
  {
    id: 11, title: "玫瑰少年", album: "自传", year: 2016, color: "#e91e8c",
    coverUrl: "",
    lyricsExcerpt: "你是你爸爸妈妈的宝\n也是星星月亮的光\n每一个人都是\n独一无二的宝",
    backgroundStory: "Apple Music 热门 Top 10。2018年因被献给被霸凌身亡的 LGBTQ+ 青年叶永鋕而再度爆红，成为全球华语社群反霸凌、支持多元认同的精神之歌。"
  },
  {
    id: 12, title: "派对动物", album: "派对动物", year: 2016, color: "#f72585",
    coverUrl: "",
    lyricsExcerpt: "我们都是派对动物\n在人群里疯狂\n在夜晚里燃烧\n遗忘所有悲伤",
    backgroundStory: "Apple Music 热门 Top 10。写于鸟巢演唱会后台，是五月天最具 EDM 风格的摇滚单曲，演唱会上全场跳动的画面成为标志性瞬间。"
  },
  {
    id: 13, title: "倔强", album: "时光机", year: 2002, color: "#c0392b",
    coverUrl: "",
    lyricsExcerpt: "我就是我\n是颜色不一样的烟火\n天空海阔\n要做最坚强的泡沫",
    backgroundStory: "写于台湾经济最低迷的2002年，副歌「颜色不一样的烟火」成为华语摇滚史上最强大的自我认同宣言，无数人将这句话文在身上。"
  },
  {
    id: 14, title: "你不是真正的快乐", album: "自传", year: 2016, color: "#6c5ce7",
    coverUrl: "",
    lyricsExcerpt: "你不是真正的快乐\n你的笑只是你穿的保护色\n你决定不恨了\n也决定不爱了",
    backgroundStory: "首播后一周内创下华语单曲最快破亿播放纪录，写给所有假装快乐的人。被心理咨询师广泛推荐，也是五月天作品中被抑郁症患者引用最多的歌词。"
  },
  {
    id: 15, title: "知足", album: "知足 最真杰作选", year: 2005, color: "#00b4d8",
    coverUrl: "",
    lyricsExcerpt: "怎么去拥有\n一道彩虹\n怎么去拥抱\n一夏天的风\n天上的星星\n笑地上的人\n总是不能懂\n不能知足",
    backgroundStory: "写于成员三十岁前后的感悟，关于欲望与满足的永恒命题。被无数毕业典礼选为主题曲，是华语歌坛「人生感悟曲」中最被传唱的作品。"
  },
  {
    id: 16, title: "天使", album: "人生海海", year: 2001, color: "#90e0ef",
    coverUrl: "",
    lyricsExcerpt: "你是我的天使\n带我飞越\n所有不可能的边界\n只因为你来过我身边",
    backgroundStory: "弦乐与 arpeggio 吉他的对话是五月天首次编曲实验，后来成为华语摇滚情歌的经典范本，也是演唱会上最多人泪崩的安可曲之一。"
  },
  {
    id: 17, title: "相信", album: "人生海海", year: 2001, color: "#2d6a4f",
    coverUrl: "",
    lyricsExcerpt: "相信\n相信我\n只要有你在\n再苦的路\n都值得走下去",
    backgroundStory: "是五月天最直白的鼓励系歌曲，无数运动队伍、考生在赛前考前播放。阿信说这是他写过「门槛最低却最难写」的一首歌。"
  },
  {
    id: 18, title: "听不到", album: "人生海海", year: 2001, color: "#457b9d",
    coverUrl: "",
    lyricsExcerpt: "听不到\n我已经听不到\n你的声音\n消失在风里",
    backgroundStory: "人生海海专辑中流量最稳定的情歌，描写失去后的静默感，怪兽的吉他 riff 极简却极准，被乐评称为五月天写「失去」这个主题的最高水准。"
  },
  {
    id: 19, title: "后青春期的诗", album: "后青春期的诗", year: 2008, color: "#5c4033",
    coverUrl: "",
    lyricsExcerpt: "这是你的人生\n属于你的一首诗\n你是作者\n只有你能写下去",
    backgroundStory: "专辑同名曲，写给所有在二十多岁迷失的人，是五月天第一次用「诗」定义一张专辑的意图声明。被无数毕业典礼、成人礼选为主题曲。"
  },
  {
    id: 20, title: "恋爱ing", album: "时光机", year: 2002, color: "#ff6b6b",
    coverUrl: "",
    lyricsExcerpt: "我宣布\n我爱上了你\n全世界都要知道\n因为你是我的\n世界里最美丽的风景",
    backgroundStory: "被誉为华语流行乐「告白」主题的范本，MTV 播放量在台湾打破当年记录，是五月天最商业化也最欢快的单曲，KTV 必点。"
  },
  {
    id: 21, title: "笑忘歌", album: "后青春期的诗", year: 2008, color: "#4cc9f0",
    coverUrl: "",
    lyricsExcerpt: "笑着笑着就哭了\n哭着哭着就忘了\n原来快乐和悲伤\n只差了一个笑",
    backgroundStory: "改编自米兰·昆德拉《笑忘书》书名，阿信说：「忘记是笑着的，还是笑是为了忘记？我也不知道。」"
  },
  {
    id: 22, title: "私奔到月球", album: "为爱而生", year: 2006, color: "#c8b6ff",
    coverUrl: "",
    lyricsExcerpt: "私奔到月球\n和你\n不管别人怎么说\n我们就这样离去",
    backgroundStory: "与陈绮贞合唱版本跨越摇滚与流行界限，至今仍是节日派对必放曲目，也是恋人之间最常用作表白场景的五月天歌曲之一。"
  },
  {
    id: 23, title: "我心中尚未崩坏的地方", album: "为爱而生", year: 2006, color: "#5f0f40",
    coverUrl: "",
    lyricsExcerpt: "我心中尚未崩坏的地方\n还保留着纯真的模样\n不管世界有多么荒凉\n总有一处是我的天堂",
    backgroundStory: "五月天最著名的长曲名作品，第一首超过五分钟仍维持高度商业成功的史诗摇滚，写给还没有放弃梦想的人，演唱会全场举手呼应是标志性画面。"
  },
  {
    id: 24, title: "盛夏光年", album: "为爱而生", year: 2006, color: "#f9c74f",
    coverUrl: "",
    lyricsExcerpt: "逆光的方向\n是你的脸庞\n永远的盛夏\n永远年轻",
    backgroundStory: "为同名台湾青春电影创作，被誉为华语青春题材主题曲的天花板，每逢毕业季都会重新冲上热搜，代表了无数人对青春的集体记忆。"
  },
  {
    id: 25, title: "离开地球表面", album: "时光机", year: 2002, color: "#1a1a2e",
    coverUrl: "",
    lyricsExcerpt: "跳起来\n离开地球表面\n只要一秒钟\n没有人可以抓住我",
    backgroundStory: "现场最具爆发力的曲目之一，怪兽的 guitar solo 在早期创作中达到最高峰。每次演唱会前奏一响，数万人同时跳起的画面是五月天最标志性的现场瞬间。"
  },
  {
    id: 26, title: "伤心的人别听慢歌", album: "神的孩子都在跳舞", year: 2004, color: "#e63946",
    coverUrl: "",
    lyricsExcerpt: "伤心的人别听慢歌\n温柔是把利刃\n会让人流眼泪\n而且泪流不止",
    backgroundStory: "歌名本身就是一句警告，是五月天写「分手」主题最精准的表达。KTV 人均必点，也是失恋时被推荐收听次数最多的五月天歌曲。"
  },
  {
    id: 27, title: "入阵曲", album: "第二人生", year: 2011, color: "#8b0000",
    coverUrl: "",
    lyricsExcerpt: "背水一战\n成王败寇\n留名青史\n或是烟消云散",
    backgroundStory: "最具战斗属性的摇滚曲，与台湾棒球队合作拍摄 MV，成为2013年台湾体育精神代言歌曲，演唱会开场版能让全场六万人同声嘶吼。"
  },
  {
    id: 28, title: "时光机", album: "时光机", year: 2002, color: "#6a0572",
    coverUrl: "",
    lyricsExcerpt: "如果时光能够倒流\n我会好好珍惜\n每一次与你相遇的瞬间",
    backgroundStory: "五月天最著名的时间命题之作，是最标志性的演唱会安可曲之一，启发了无数华语流行歌曲的「时光」主题，也是「如果能重来」这一命题的最早华语摇滚表达。"
  },
  {
    id: 29, title: "步步", album: "后青春期的诗", year: 2008, color: "#3a0ca3",
    coverUrl: "",
    lyricsExcerpt: "步步\n每一步\n走出我的天地\n不管未来是什么\n都会是我的痕迹",
    backgroundStory: "最铿锵有力的励志曲，节奏型受 Coldplay 影响，但情感内核是纯台湾式的不服输精神，是运动会、毕业典礼最常播放的背景乐之一。"
  },
  {
    id: 30, title: "超人", album: "后青春期的诗", year: 2008, color: "#e76f51",
    coverUrl: "",
    lyricsExcerpt: "不是每个人\n都能成为超人\n但每个人\n都有属于自己的英雄时刻",
    backgroundStory: "写给所有假装坚强的成年人，被心理咨询师推荐为「自我接纳」聆听曲目，是五月天作品中「允许自己脆弱」这一主题的最早表达。"
  },
  {
    id: 31, title: "志明与春娇", album: "爱情万岁", year: 2000, color: "#e94560",
    coverUrl: "",
    lyricsExcerpt: "志明喜欢春娇\n春娇不喜欢志明\n志明送给春娇一个皮包\n春娇用那皮包出去约会别人",
    backgroundStory: "台湾文化中最知名的流行歌曲叙事之一，原型是阿信求学时代目睹的一段暗恋悲剧，轻描淡写却令无数人落泪，是单恋者的万用主题曲。"
  },
  {
    id: 32, title: "人生海海", album: "人生海海", year: 2001, color: "#0f3460",
    coverUrl: "",
    lyricsExcerpt: "人生海海\n起起落落落落又起起\n有时候失去\n才是得到",
    backgroundStory: "以闽南语「人生起起落落如海浪」为意象，是五月天首次融入台湾本土文化意象的史诗级作品，MV 在高雄港取景，是宝岛摇滚最有质感的一次本土表达。"
  },
  {
    id: 33, title: "如烟", album: "自传", year: 2016, color: "#74b9ff",
    coverUrl: "",
    lyricsExcerpt: "有没有那么一种永远\n永远不改变\n拥抱过的美丽都\n不会再走远",
    backgroundStory: "阿信历时三年才完成歌词，每次修改都是因为觉得「还不够诚实」，是他面对时间流逝最坦诚的一次书写，也是《自传》专辑中情绪密度最高的单曲。"
  },
  {
    id: 34, title: "将军令", album: "第二人生", year: 2011, color: "#9d0208",
    coverUrl: "",
    lyricsExcerpt: "人生有时候\n就是一个人走\n走着走着\n就习惯了\n就变强了",
    backgroundStory: "史上节奏最快、演唱会现场最燃的开场曲，灵感来自中国古典战鼓，融入重金属低频压迫感，曾创下演唱会倒计时最后一秒播出时最大分贝欢呼的纪录。"
  },
  {
    id: 35, title: "一颗苹果", album: "第二人生", year: 2011, color: "#c1121f",
    coverUrl: "",
    lyricsExcerpt: "如果全世界只剩下一颗苹果\n我把它留给你\n因为\n你是我的全世界",
    backgroundStory: "以末世寓言包裹的极简主义情歌，阿信称它是他最喜欢的自作词之一，意象密度在五月天所有作品中无出其右，被文学系学生多次选为分析文本。"
  },
  {
    id: 36, title: "最重要的小事", album: "第二人生", year: 2011, color: "#ffb703",
    coverUrl: "",
    lyricsExcerpt: "一个早安\n一个晚安\n原来最重要的\n都是这些小事",
    backgroundStory: "阿信写完后说：「我终于学会了把大道理藏进小细节里。」是情侣之间被引用次数最多的五月天歌词来源，也是他创作成熟度的标志性节点。"
  },
  {
    id: 37, title: "憨人", album: "自传", year: 2016, color: "#264653",
    coverUrl: "",
    lyricsExcerpt: "不是傻\n只是比别人\n多一点不甘心\n多一点想要继续",
    backgroundStory: "台语「憨人」意为傻瓜，混用普通话与闽南语，是五月天向台湾本土语言文化最深情的致敬。台语腔调与摇滚的结合让非台语人也能感受到那份固执的温柔。"
  },
  {
    id: 38, title: "你好不好", album: "你好不好 (单曲)", year: 2015, color: "#3d405b",
    coverUrl: "",
    lyricsExcerpt: "你好不好\n是我每天早上醒来\n第一个想到的问题",
    backgroundStory: "为电影《我的少女时代》所作，简单的问句承载了无法言说的思念密度，是五月天作品中「沉默的想念」这一意象表达得最精准的一首。"
  },
  {
    id: 39, title: "转眼", album: "转眼 (单曲)", year: 2019, color: "#4a4e69",
    coverUrl: "",
    lyricsExcerpt: "转眼\n就这样转眼\n所有的青春\n都变成了歌",
    backgroundStory: "写于五月天成军二十周年，是阿信对青春消逝最平静的接受，也是他创作风格从愤怒走向平和的分水岭，首演时阿信落泪，全场随之哭倒一片。"
  },
  {
    id: 40, title: "星空", album: "人生海海", year: 2001, color: "#03045e",
    coverUrl: "",
    lyricsExcerpt: "在最深的黑暗里\n才能看见最亮的星\n只要你还在\n就还有光",
    backgroundStory: "大量空间混响营造出在真实星空下演奏的临场感，是演唱会压轴前最常用的情绪准备曲目，也是五月天歌迷在天文摄影群里附上最多次的配乐。"
  },
  {
    id: 41, title: "顽固", album: "自传", year: 2016, color: "#6d6875",
    coverUrl: "",
    lyricsExcerpt: "顽固\n就是这么顽固\n就算全世界要我放弃\n我就是不放弃",
    backgroundStory: "《自传》专辑中最具力量感的摇滚曲，「顽固」是对放弃者的反驳，现场版高潮段落能让六万人同声嘶吼，是阿信自认「写得最用力」的一首歌词。"
  },
  {
    id: 42, title: "成名在望", album: "自传", year: 2016, color: "#e63946",
    coverUrl: "",
    lyricsExcerpt: "我要成名\n在那个遥远的地方\n就算全世界都说我不行\n我偏偏就要",
    backgroundStory: "写给所有在追梦路上迷失的年轻人，歌名呼应 Cameron Crowe 电影《成名在望》，是五月天对摇滚精神最文艺的注解，也是自传演唱会的核心曲目。"
  },
  {
    id: 43, title: "为爱而生", album: "为爱而生", year: 2006, color: "#d62828",
    coverUrl: "",
    lyricsExcerpt: "我是为爱而生\n哪怕最后\n什么都没得到\n也没有遗憾",
    backgroundStory: "阿信在一次深夜失眠后写下，是他对「存在意义」最直白的自问，后来成为五月天中期的精神核心曲目。"
  },
  {
    id: 44, title: "勇敢", album: "派对动物", year: 2016, color: "#7209b7",
    coverUrl: "",
    lyricsExcerpt: "勇敢\n说起来容易\n做起来需要\n闭上眼睛往前走",
    backgroundStory: "阿信在脸书直播创作过程的首支歌曲，词曲框架在两小时内完成，灵感来自他儿子在海边克服恐惧跳水的瞬间，是五月天近年最具现场感染力的励志曲。"
  },
  {
    id: 45, title: "华丽的冒险", album: "神的孩子都在跳舞", year: 2004, color: "#f4a261",
    coverUrl: "",
    lyricsExcerpt: "这一生\n是多么华丽的冒险\n每一步\n都算数",
    backgroundStory: "融合爱尔兰民谣节奏与台湾摇滚能量，MV 在冰岛取景，是五月天在编曲上走得最远的一次探索，被乐评称为「华语摇滚最接近 U2 的作品」。"
  },
  {
    id: 46, title: "诺亚方舟", album: "神的孩子都在跳舞", year: 2004, color: "#003049",
    coverUrl: "",
    lyricsExcerpt: "不管世界最后变成什么样\n还好\n有你陪我看这一切",
    backgroundStory: "以圣经诺亚方舟意象包裹的末世情歌，MV 在台湾南部泥地与暴雨中拍摄，是五月天所有作品里「末日时想要陪在谁身边」回答得最美的一首。"
  },
  {
    id: 47, title: "DNA", album: "自传", year: 2016, color: "#0077b6",
    coverUrl: "",
    lyricsExcerpt: "你的血液里\n流着我的音乐\n我们的 DNA\n永远在一起",
    backgroundStory: "写给所有五月天歌迷的情书，「DNA」隐喻乐队与歌迷之间无法切断的连结，是自传演唱会上现场情绪最高点的曲目之一。"
  },
  {
    id: 48, title: "爱情万岁", album: "爱情万岁", year: 2000, color: "#c84b31",
    coverUrl: "",
    lyricsExcerpt: "爱情万岁\n就算全世界都要我放弃\n我还是要\n大声说爱情万岁",
    backgroundStory: "专辑同名曲，是五月天对台湾九○年代青年文化的致敬，也是乐队第一次正面直击「爱」这个主题的宣言式作品。"
  },
  {
    id: 49, title: "第二人生", album: "第二人生", year: 2011, color: "#023e8a",
    coverUrl: "",
    lyricsExcerpt: "如果可以选择\n我还是会选择\n在最美的那一刻\n遇见你",
    backgroundStory: "专辑概念源自「如果人生可以重来」的思想实验，阿信称这张专辑是他三十岁后第一次认真面对死亡主题的创作，同名主打曲是整张专辑最私密的情感出口。"
  },
  {
    id: 50, title: "人生海海 (重生版)", album: "人生海海 二十年重唱", year: 2019, color: "#1b4332",
    coverUrl: "",
    lyricsExcerpt: "我曾经跌倒过\n我曾经哭泣过\n但我还是站起来\n继续向前走",
    backgroundStory: "五月天成军二十周年重新演绎早期代表作，加入了两代乐迷共同合唱的混音轨，是五月天迄今制作规模最大的重录单曲，也是他们献给时间的一封情书。"
  },
];
