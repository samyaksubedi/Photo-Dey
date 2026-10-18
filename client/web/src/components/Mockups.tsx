import { QRCodeSVG } from 'qrcode.react';
import { Bust, Scene, type SceneKind } from './Scene';

export function ChatPhone({ event = 'Priya & Arjun Wedding', count = 24 }: { event?: string; count?: number }) {
  return (
    <div className="phone" aria-hidden="true">
      <div className="phone-notch" />
      <div className="chat-head">
        <img src="/logo-mark.png" alt="" />
        <div>
          <strong>PhotoDey</strong>
          <small>bot</small>
        </div>
      </div>
      <div className="chat-body">
        <p className="bubble bubble-bot">
          Welcome to <b>{event}</b>. Send one clear selfie and I will find your photos.
        </p>
        <div className="bubble bubble-me bubble-selfie">
          <svg viewBox="0 0 120 120">
            <rect width="120" height="120" fill="#F8E1E6" />
            <Bust x={60} y={52} s={0.95} skin={1} cloth="#1F6F6B" longHair />
          </svg>
        </div>
        <p className="bubble bubble-bot">Looking through the event photos.</p>
        <p className="bubble bubble-bot">
          We found <b>{count} photos</b> of you.
          <span className="bubble-btn">Open my gallery</span>
        </p>
      </div>
    </div>
  );
}

export function TableCard({
  event = 'Priya & Arjun',
  url = 'https://photodey.com/e/priya-arjun',
}: {
  event?: string;
  url?: string;
}) {
  return (
    <div className="tablecard" aria-hidden="true">
      <div className="tablecard-top">
        <img src="/logo-mark.png" alt="" />
        <span>PhotoDey</span>
      </div>
      <h4>Find your photos</h4>
      <p>Scan, send one selfie on Telegram, and get every photo you are in.</p>
      <div className="tablecard-qr">
        <QRCodeSVG value={url} size={128} level="M" marginSize={0} fgColor="#2B0E18" bgColor="#ffffff" />
      </div>
      <small>{event}</small>
    </div>
  );
}

const tiles: Array<[SceneKind, [number, number, number, number]]> = [
  ['wedding', [60, 40, 220, 165]],
  ['wedding', [150, 90, 200, 150]],
  ['family', [40, 70, 240, 180]],
  ['concert', [100, 80, 220, 165]],
  ['party', [90, 60, 220, 165]],
  ['college', [60, 60, 240, 180]],
  ['wedding', [20, 60, 220, 165]],
  ['family', [150, 80, 220, 165]],
];

export function DashMock() {
  return (
    <div className="dashmock" aria-hidden="true">
      <div className="dm-rail">
        <img src="/logo.png" alt="" />
        <i className="is-on" />
        <i />
        <i />
      </div>
      <div className="dm-main">
        <div className="dm-head">
          <div>
            <b>Priya &amp; Arjun Wedding</b>
            <span>1,240 photos</span>
          </div>
          <span className="dm-pill">Ready to share</span>
        </div>
        <div className="dm-progress">
          <div>
            <span>Face matching</span>
            <b>100%</b>
          </div>
          <i>
            <u />
          </i>
        </div>
        <div className="dm-grid">
          {tiles.map(([kind, crop], index) => (
            <div key={index}>
              <Scene kind={kind} crop={crop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
