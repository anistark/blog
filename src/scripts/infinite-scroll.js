export function handleInfiniteScroll() {
  const loadMoreBtn = document.getElementById('load-more-btn');
  const postsContainer = document.getElementById('posts-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  const articleCounter = document.getElementById('article-counter');

  if (!loadMoreBtn || !postsContainer) {
    // Not on a page with pagination
    return;
  }

  let isLoading = false;

  // Function to load and append posts from next page
  async function loadMorePosts() {
    if (isLoading) return;

    const nextPageUrl = loadMoreBtn.getAttribute('data-next-page');
    if (!nextPageUrl) return;

    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.classList.add('opacity-50', 'cursor-not-allowed');
    if (loadingIndicator) {
      loadingIndicator.classList.remove('hidden');
    }

    try {
      const response = await fetch(nextPageUrl);
      if (!response.ok) {
        throw new Error('Failed to load more posts');
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract posts from the fetched page
      const newPostsContainer = doc.getElementById('posts-container');
      let newPostsCount = 0;

      if (newPostsContainer) {
        const newPosts = newPostsContainer.querySelectorAll('.post-item');
        newPostsCount = newPosts.length;

        // Append each post to the current page
        newPosts.forEach(post => {
          postsContainer.appendChild(post.cloneNode(true));
        });
      }

      // Update the load more button with the next page URL
      const newPaginationContainer = doc.querySelector('.pagination-container');
      const newLoadMoreBtn = newPaginationContainer?.querySelector('#load-more-btn');

      if (newLoadMoreBtn) {
        // Update button data attributes for next page
        const newNextPageUrl = newLoadMoreBtn.getAttribute('data-next-page');
        const newCurrentPage = newLoadMoreBtn.getAttribute('data-current-page');
        const newLoadedCount = newLoadMoreBtn.getAttribute('data-loaded-count');

        loadMoreBtn.setAttribute('data-next-page', newNextPageUrl);
        loadMoreBtn.setAttribute('data-current-page', newCurrentPage);
        loadMoreBtn.setAttribute('data-loaded-count', newLoadedCount);

        // Update the article counter text
        const totalCount = loadMoreBtn.getAttribute('data-total-count');
        if (articleCounter) {
          articleCounter.textContent = `Loaded ${newLoadedCount} of ${totalCount} articles`;
        }
      } else {
        // No more pages - hide button and show end message
        loadMoreBtn.style.display = 'none';
        const totalCount = loadMoreBtn.getAttribute('data-total-count');
        if (articleCounter) {
          articleCounter.textContent = `You've reached the end! (${totalCount} articles total)`;
        }
      }

    } catch (error) {
      console.error('Error loading more posts:', error);
      alert('Failed to load more posts. Please try again.');
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
      }
    }
  }

  // Handle button click
  loadMoreBtn.addEventListener('click', loadMorePosts);

  // Optional: Auto-load when button comes into view (infinite scroll behavior)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isLoading) {
        loadMorePosts();
      }
    });
  }, {
    rootMargin: '100px' // Trigger 100px before button is visible
  });

  // Uncomment the line below to enable auto-loading on scroll
  // observer.observe(loadMoreBtn);
}
