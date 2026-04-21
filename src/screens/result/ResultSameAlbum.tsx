import type { Song } from '../../data/songs';

interface ResultSameAlbumProps {
  songs: Song[];
  defeatedSongs: Song[];
}

export default function ResultSameAlbum({ songs, defeatedSongs }: ResultSameAlbumProps) {
  return (
    <>
      {defeatedSongs.length > 0 && (
        <>
          <div className="result-section-divider" />
          <div className="result-section">
            <div className="result-section-title">一路击败的对手</div>
            <div className="defeated-chips">
              {defeatedSongs.map((s) => (
                <span key={s.id} className="defeated-chip">
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {songs.length > 0 && (
        <>
          <div className="result-section-divider" />
          <div className="result-section">
            <div className="result-section-title">同专辑 · 你可能也爱</div>
            <div className="same-album-chips">
              {songs.map((s) => (
                <span key={s.id} className="same-album-chip">
                  {s.title}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
