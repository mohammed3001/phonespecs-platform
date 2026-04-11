'use client';

export function PhoneVideoPlayer({ videos }: { videos: { url: string; title?: string }[] }) {
  if (!videos?.length) return null;
  return (
    <div className="space-y-3">
      {videos.map((video, idx) => (
        <div key={idx} className="rounded-xl overflow-hidden bg-black">
          <video controls className="w-full" preload="metadata">
            <source src={video.url} />
          </video>
          {video.title && <p className="text-sm text-gray-400 px-3 py-2">{video.title}</p>}
        </div>
      ))}
    </div>
  );
}
