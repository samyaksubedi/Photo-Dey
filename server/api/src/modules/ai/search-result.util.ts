type SearchCompletionMessageInput = {
  matchCount: number;
  galleryLink?: string;
};

export const hasSearchMatches = (matchCount: number) => matchCount > 0;

export const buildSearchCompletionMessage = ({
  matchCount,
  galleryLink,
}: SearchCompletionMessageInput) => {
  if (!hasSearchMatches(matchCount)) {
    return `🔍 We couldn't find any matching photos.

Try again with a clear, front-facing selfie in good lighting.

If the event photos are still being uploaded, you can also try again later.`;
  }

  if (!galleryLink) {
    throw new Error('Gallery link is required when search matches exist');
  }

  return `🎉 Your gallery is ready!

We found ${matchCount} matching photo${matchCount === 1 ? '' : 's'}.

📂 ${galleryLink}`;
};
