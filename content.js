(async () => {
  console.log("Find Air Reply: script loaded");

  // プロフィールページでクエリパラメータがあれば自動スクロール
  const params = new URLSearchParams(window.location.search);
  const tweetId = params.get("findAirReply");
  const userMatch = window.location.pathname.match(/^\/([^\/]+)\/?$/);
  if (tweetId && userMatch) {
    console.log("Find Air Reply: プロフィールページ検出", userMatch[1], tweetId);

    // article要素が現れるまで最大5秒待つ
    async function waitForArticles(timeout = 5000) {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const articles = document.querySelectorAll("article");
        if (articles.length !== 0) return;
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // 自動スクロール
    await waitForArticles();
    for (let i = 0; i < 250; i++) {
      const tweet = document.querySelector(`a[href$="/status/${tweetId}"]`);
      if (tweet) {
        tweet.scrollIntoView({ behavior: "smooth", block: "center" });
        tweet.style.boxShadow = "0 0 0 4px red";
        console.log("スクロール回数:", i + 1);
        return;
      }

      const articles = document.querySelectorAll("article");
      if (articles.length)
        articles[articles.length - 1].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

      await new Promise((r) => setTimeout(r, 100)); // 少し待つ
    }
    console.log("該当ツイートが見つかりませんでした");

    return;
  }

  // ツイートページなら各articleにリンクを自動追加
  const tweetPageMatch = window.location.pathname.match(
    /^\/([^\/]+)\/status\/(\d+)/
  );
  if (tweetPageMatch) {
    const username = tweetPageMatch[1];
    const tweetId = tweetPageMatch[2];

    // FIXME use querySelector
    // MutationObserverで新しいarticleにも対応
    const addLinkToArticles = () => {
      const article = document.querySelector("article");
      if (!article) return;
      if (article.querySelector(".find-air-reply-link")) return;
      const link = document.createElement("a");
      link.textContent = "エアリプ元を探す";
      link.href = `https://x.com/${username}?findAirReply=${tweetId}`;
      link.className = "find-air-reply-link";
      link.style.marginLeft = "8px";
      link.style.color = "#1da1f2";
      link.style.cursor = "pointer";
      article.appendChild(link);
    };

    addLinkToArticles();

    // 動的追加にも対応
    const observer = new MutationObserver(addLinkToArticles);
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
