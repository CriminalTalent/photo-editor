import React, { useState, useRef } from 'react';

export default function App() {
  const [baseImage, setBaseImage] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [textStickers, setTextStickers] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cropMode, setCropMode] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [textInput, setTextInput] = useState('');
  const [emojiInput, setEmojiInput] = useState('😊');
  const [textSize, setTextSize] = useState(24);
  const [emojiSize, setEmojiSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textStroke, setTextStroke] = useState('#000000');
  const [textStrokeWidth, setTextStrokeWidth] = useState(2);
  const [tab, setTab] = useState('draw');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleBaseImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBaseImage(event.target.result);
        setStickers([]);
        setEmojis([]);
        setTextStickers([]);
        setSelectedIndex(null);
        setSelectedType(null);
        setCropMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStickerUpload = (e) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setStickers((prev) => [...prev, { id: Date.now() + Math.random(), src: event.target.result, x: 50, y: 50, size: 80, rotation: 0 }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addTextSticker = () => {
    if (textInput.trim()) {
      setTextStickers((prev) => [...prev, { id: Date.now() + Math.random(), text: textInput, x: 50, y: 50, size: textSize, rotation: 0, color: textColor, stroke: textStroke, strokeWidth: textStrokeWidth }]);
      setTextInput('');
    }
  };

  const addEmoji = () => {
    if (emojiInput.trim()) {
      setEmojis((prev) => [...prev, { id: Date.now() + Math.random(), emoji: emojiInput, x: 50, y: 50, size: emojiSize, rotation: 0 }]);
    }
  };

  const handlePointerDown = (e, index, type) => {
    if (cropMode) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;
    
    setDraggingIndex(index);
    setSelectedIndex(index);
    setSelectedType(type);
    
    let obj;
    if (type === 'sticker') obj = stickers[index];
    else if (type === 'emoji') obj = emojis[index];
    else if (type === 'text') obj = textStickers[index];
    
    setDragOffset({ x: posX - obj.x, y: posY - obj.y });
  };

  const handlePointerMove = (e) => {
    if (draggingIndex === null || !selectedType || cropMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;

    if (selectedType === 'sticker') {
      const newStickers = [...stickers];
      newStickers[draggingIndex].x = Math.max(0, posX - dragOffset.x);
      newStickers[draggingIndex].y = Math.max(0, posY - dragOffset.y);
      setStickers(newStickers);
    } else if (selectedType === 'emoji') {
      const newEmojis = [...emojis];
      newEmojis[draggingIndex].x = Math.max(0, posX - dragOffset.x);
      newEmojis[draggingIndex].y = Math.max(0, posY - dragOffset.y);
      setEmojis(newEmojis);
    } else if (selectedType === 'text') {
      const newTextStickers = [...textStickers];
      newTextStickers[draggingIndex].x = Math.max(0, posX - dragOffset.x);
      newTextStickers[draggingIndex].y = Math.max(0, posY - dragOffset.y);
      setTextStickers(newTextStickers);
    }
  };

  const handlePointerUp = () => {
    setDraggingIndex(null);
  };

  const updateItem = (index, type, updates) => {
    if (type === 'sticker') {
      const newStickers = [...stickers];
      newStickers[index] = { ...newStickers[index], ...updates };
      setStickers(newStickers);
    } else if (type === 'emoji') {
      const newEmojis = [...emojis];
      newEmojis[index] = { ...newEmojis[index], ...updates };
      setEmojis(newEmojis);
    } else if (type === 'text') {
      const newTextStickers = [...textStickers];
      newTextStickers[index] = { ...newTextStickers[index], ...updates };
      setTextStickers(newTextStickers);
    }
  };

  const deleteItem = (index, type) => {
    if (type === 'sticker') {
      setStickers(stickers.filter((_, i) => i !== index));
    } else if (type === 'emoji') {
      setEmojis(emojis.filter((_, i) => i !== index));
    } else if (type === 'text') {
      setTextStickers(textStickers.filter((_, i) => i !== index));
    }
    setSelectedIndex(null);
    setSelectedType(null);
  };

  const cropImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.onload = () => {
      const scale = baseImg.width / containerRef.current.clientWidth;
      const croppedX = cropBox.x * scale;
      const croppedY = cropBox.y * scale;
      const croppedWidth = cropBox.width * scale;
      const croppedHeight = cropBox.height * scale;

      canvas.width = croppedWidth;
      canvas.height = croppedHeight;
      ctx.drawImage(baseImg, croppedX, croppedY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

      const croppedImage = canvas.toDataURL();
      setBaseImage(croppedImage);
      setCropMode(false);
    };
    baseImg.src = baseImage;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      alert('캔버스 생성 실패');
      return;
    }
    const ctx = canvas.getContext('2d');
    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    const dpiScale = 2;
    
    baseImg.onload = () => {
      try {
        canvas.width = baseImg.width * dpiScale;
        canvas.height = baseImg.height * dpiScale;
        ctx.scale(dpiScale, dpiScale);
        ctx.drawImage(baseImg, 0, 0);
        const scale = baseImg.width / containerRef.current.clientWidth;

        emojis.forEach((emoji) => {
          ctx.save();
          ctx.font = `${emoji.size * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate((emoji.x + emoji.size / 2) * scale, (emoji.y + emoji.size / 2) * scale);
          ctx.rotate((emoji.rotation * Math.PI) / 180);
          ctx.fillText(emoji.emoji, 0, 0);
          ctx.restore();
        });

        textStickers.forEach((textSticker) => {
          ctx.save();
          ctx.font = `bold ${textSticker.size * scale}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate((textSticker.x + textSticker.size / 2) * scale, (textSticker.y + textSticker.size / 2) * scale);
          ctx.rotate((textSticker.rotation * Math.PI) / 180);
          
          if (textSticker.strokeWidth > 0) {
            ctx.strokeStyle = textSticker.stroke;
            ctx.lineWidth = textSticker.strokeWidth * scale;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.strokeText(textSticker.text, 0, 0);
          }
          ctx.fillStyle = textSticker.color;
          ctx.fillText(textSticker.text, 0, 0);
          ctx.restore();
        });

        let loadedCount = 0;
        const totalStickers = stickers.length;

        if (totalStickers === 0) {
          setTimeout(() => {
            try {
              const imageData = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = imageData;
              link.download = `photo_${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              alert('✓ 고해상도 다운로드 완료!');
            } catch (error) {
              alert('다운로드 실패: ' + error.message);
            }
          }, 100);
        } else {
          stickers.forEach((sticker) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                ctx.save();
                const centerX = (sticker.x + sticker.size / 2) * scale;
                const centerY = (sticker.y + sticker.size / 2) * scale;
                ctx.translate(centerX, centerY);
                ctx.rotate((sticker.rotation * Math.PI) / 180);
                ctx.drawImage(img, -(sticker.size / 2) * scale, -(sticker.size / 2) * scale, sticker.size * scale, sticker.size * scale);
                ctx.restore();
                loadedCount++;
                if (loadedCount === totalStickers) {
                  setTimeout(() => {
                    try {
                      const imageData = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.href = imageData;
                      link.download = `photo_${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      alert('✓ 고해상도 다운로드 완료!');
                    } catch (error) {
                      alert('다운로드 실패: ' + error.message);
                    }
                  }, 100);
                }
              } catch (error) {
                console.error('스티커 처리 오류:', error);
              }
            };
            img.onerror = () => {
              loadedCount++;
              if (loadedCount === totalStickers) {
                setTimeout(() => {
                  try {
                    const imageData = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = imageData;
                    link.download = `photo_${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    alert('✓ 고해상도 다운로드 완료!');
                  } catch (error) {
                    alert('다운로드 실패: ' + error.message);
                  }
                }, 100);
              }
            };
            img.src = sticker.src;
          });
        }
      } catch (error) {
        alert('처리 오류: ' + error.message);
      }
    };
    baseImg.onerror = () => {
      alert('이미지 로드 실패');
    };
    baseImg.src = baseImage;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a1929', color: '#ffffff', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '12px', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 5px;
          background: #2a3a4e;
          border-radius: 3px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #D4AF37;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: #D4AF37;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
        }
      `}</style>

      {!baseImage ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 12px 0', color: '#D4AF37' }}>포토 에디터</h1>
          <p style={{ fontSize: '14px', color: '#8899aa', margin: '0 0 40px 0' }}>이미지를 편집하고 공유하세요</p>
          <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px solid #D4AF37', borderRadius: '12px', padding: '60px 30px', textAlign: 'center', cursor: 'pointer', background: '#1a2a3e', width: '100%', maxWidth: '400px' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>🖼️</div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>사진 선택</h2>
            <p style={{ fontSize: '13px', color: '#8899aa', margin: '0' }}>클릭하여 업로드</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '0', color: '#D4AF37' }}>포토 에디터</h1>
            <button onClick={() => setBaseImage(null)} style={{ padding: '6px 12px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              새로 시작
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', flex: 1, minHeight: '0' }}>
            <div 
              ref={containerRef} 
              onPointerMove={handlePointerMove} 
              onPointerUp={handlePointerUp} 
              onPointerLeave={handlePointerUp}
              style={{ 
                position: 'relative', 
                backgroundImage: `url(${baseImage})`, 
                backgroundSize: 'contain', 
                backgroundRepeat: 'no-repeat', 
                backgroundPosition: 'center', 
                width: '100%', 
                height: '100%', 
                minHeight: '300px', 
                border: '1px solid #2a3a4e', 
                borderRadius: '8px', 
                cursor: cropMode ? 'crosshair' : 'default', 
                backgroundColor: '#050a11', 
                overflow: 'hidden',
                touchAction: 'none'
              }}>
              {cropMode && (
                <div 
                  onPointerDown={(e) => {
                    e.preventDefault();
                    const rect = containerRef.current.getBoundingClientRect();
                    const startX = e.clientX - rect.left - cropBox.x;
                    const startY = e.clientY - rect.top - cropBox.y;
                    
                    const handleDrag = (moveE) => {
                      const newX = Math.max(0, moveE.clientX - rect.left - startX);
                      const newY = Math.max(0, moveE.clientY - rect.top - startY);
                      setCropBox({ ...cropBox, x: newX, y: newY });
                    };
                    
                    const handleStop = () => {
                      document.removeEventListener('pointermove', handleDrag);
                      document.removeEventListener('pointerup', handleStop);
                    };
                    
                    document.addEventListener('pointermove', handleDrag);
                    document.addEventListener('pointerup', handleStop);
                  }}
                  style={{ 
                    position: 'absolute', 
                    left: `${cropBox.x}px`, 
                    top: `${cropBox.y}px`, 
                    width: `${cropBox.width}px`, 
                    height: `${cropBox.height}px`, 
                    border: '2px solid #D4AF37', 
                    background: 'rgba(0,0,0,0.3)', 
                    cursor: 'move',
                    touchAction: 'none'
                  }} 
                />
              )}

              {emojis.map((emoji, index) => (
                <div 
                  key={emoji.id} 
                  onPointerDown={(e) => handlePointerDown(e, index, 'emoji')} 
                  style={{ 
                    position: 'absolute', 
                    left: `${emoji.x}px`, 
                    top: `${emoji.y}px`, 
                    cursor: 'grab', 
                    userSelect: 'none', 
                    border: selectedIndex === index && selectedType === 'emoji' ? '2px solid #D4AF37' : 'none', 
                    padding: '2px', 
                    borderRadius: '4px', 
                    transform: `rotate(${emoji.rotation}deg)`,
                    touchAction: 'none'
                  }}>
                  <span style={{ fontSize: `${emoji.size}px`, display: 'block' }}>{emoji.emoji}</span>
                </div>
              ))}

              {textStickers.map((textSticker, index) => (
                <div 
                  key={textSticker.id} 
                  onPointerDown={(e) => handlePointerDown(e, index, 'text')} 
                  style={{ 
                    position: 'absolute', 
                    left: `${textSticker.x}px`, 
                    top: `${textSticker.y}px`, 
                    cursor: 'grab', 
                    userSelect: 'none', 
                    border: selectedIndex === index && selectedType === 'text' ? '2px solid #D4AF37' : 'none', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    transform: `rotate(${textSticker.rotation}deg)`,
                    touchAction: 'none'
                  }}>
                  <span style={{ fontSize: `${textSticker.size}px`, fontWeight: 'bold', color: textSticker.color, WebkitTextStroke: `${textSticker.strokeWidth}px ${textSticker.stroke}`, display: 'block', lineHeight: '1' }}>{textSticker.text}</span>
                </div>
              ))}

              {stickers.map((sticker, index) => (
                <div 
                  key={sticker.id} 
                  onPointerDown={(e) => handlePointerDown(e, index, 'sticker')} 
                  style={{ 
                    position: 'absolute', 
                    left: `${sticker.x}px`, 
                    top: `${sticker.y}px`, 
                    width: `${sticker.size}px`, 
                    height: `${sticker.size}px`, 
                    backgroundImage: `url(${sticker.src})`, 
                    backgroundSize: 'contain', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundPosition: 'center', 
                    transform: `rotate(${sticker.rotation}deg)`, 
                    cursor: 'grab', 
                    border: selectedIndex === index && selectedType === 'sticker' ? '2px solid #D4AF37' : 'none', 
                    borderRadius: '4px',
                    touchAction: 'none'
                  }} />
              ))}
            </div>

            <div style={{ background: '#1a2a3e', borderRadius: '8px', padding: '12px', border: '1px solid #2a3a4e', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[{ id: 'draw', label: '그리기' }, { id: 'text', label: '글자' }].map((item) => (
                  <button key={item.id} onClick={() => setTab(item.id)} style={{ padding: '10px', background: tab === item.id ? '#D4AF37' : '#252535', color: tab === item.id ? '#0a1929' : '#ffffff', border: '1px solid ' + (tab === item.id ? '#D4AF37' : '#3a4a5e'), borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>
                    {item.label}
                  </button>
                ))}
              </div>

              {tab === 'draw' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="file" accept="image/*" multiple onChange={handleStickerUpload} style={{ padding: '8px', fontSize: '12px', border: '1px solid #2a3a4e', borderRadius: '4px', background: '#050a11', color: '#ffffff', cursor: 'pointer' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" value={emojiInput} onChange={(e) => setEmojiInput(e.target.value)} placeholder="이모지" style={{ flex: 1, padding: '8px', border: '1px solid #2a3a4e', borderRadius: '4px', background: '#050a11', color: '#ffffff', fontSize: '14px' }} />
                    <span style={{ fontSize: '24px' }}>{emojiInput}</span>
                  </div>
                  <div><label style={{ fontSize: '10px', color: '#888' }}>크기: {emojiSize}px</label><input type="range" min="20" max="150" value={emojiSize} onChange={(e) => setEmojiSize(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                  <button onClick={addEmoji} style={{ padding: '8px', background: '#D4AF37', color: '#0a1929', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    추가
                  </button>
                </div>
              )}

              {tab === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="텍스트" style={{ padding: '8px', border: '1px solid #2a3a4e', borderRadius: '4px', background: '#050a11', color: '#ffffff', fontSize: '12px' }} onKeyPress={(e) => e.key === 'Enter' && addTextSticker()} />
                  <label style={{ fontSize: '11px', color: '#888' }}>글자색</label>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', height: '25px', borderRadius: '4px', border: 'none', cursor: 'pointer' }} />
                  <label style={{ fontSize: '11px', color: '#888' }}>테두리색</label>
                  <input type="color" value={textStroke} onChange={(e) => setTextStroke(e.target.value)} style={{ width: '100%', height: '25px', borderRadius: '4px', border: 'none', cursor: 'pointer' }} />
                  <div><label style={{ fontSize: '10px', color: '#888' }}>테두리: {textStrokeWidth}px</label><input type="range" min="0" max="5" value={textStrokeWidth} onChange={(e) => setTextStrokeWidth(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                  <div><label style={{ fontSize: '10px', color: '#888' }}>크기: {textSize}px</label><input type="range" min="12" max="72" value={textSize} onChange={(e) => setTextSize(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                  <button onClick={addTextSticker} style={{ padding: '8px', background: '#D4AF37', color: '#0a1929', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                    추가
                  </button>
                </div>
              )}

              {cropMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#050a11', padding: '10px', borderRadius: '4px', border: '1px solid #2a3a4e' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#D4AF37' }}>자르기 범위</h4>
                  <div><label style={{ fontSize: '10px', color: '#888' }}>X: {cropBox.x}px</label><input type="range" min="0" max="400" value={cropBox.x} onChange={(e) => setCropBox({ ...cropBox, x: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <div><label style={{ fontSize: '10px', color: '#888' }}>Y: {cropBox.y}px</label><input type="range" min="0" max="400" value={cropBox.y} onChange={(e) => setCropBox({ ...cropBox, y: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <div><label style={{ fontSize: '10px', color: '#888' }}>너비: {cropBox.width}px</label><input type="range" min="50" max="400" value={cropBox.width} onChange={(e) => setCropBox({ ...cropBox, width: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <div><label style={{ fontSize: '10px', color: '#888' }}>높이: {cropBox.height}px</label><input type="range" min="50" max="400" value={cropBox.height} onChange={(e) => setCropBox({ ...cropBox, height: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                </div>
              )}

              {selectedIndex !== null && selectedType === 'sticker' && (
                <div style={{ background: '#050a11', padding: '8px', borderRadius: '4px', border: '1px solid #2a3a4e' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#D4AF37' }}>스티커</h4>
                  <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '9px', color: '#888' }}>크기: {stickers[selectedIndex].size}px</label><input type="range" min="20" max="300" value={stickers[selectedIndex].size} onChange={(e) => updateItem(selectedIndex, 'sticker', { size: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '9px', color: '#888' }}>회전: {stickers[selectedIndex].rotation}°</label><input type="range" min="0" max="360" step="15" value={stickers[selectedIndex].rotation} onChange={(e) => updateItem(selectedIndex, 'sticker', { rotation: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <button onClick={() => deleteItem(selectedIndex, 'sticker')} style={{ width: '100%', padding: '6px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                    삭제
                  </button>
                </div>
              )}

              {selectedIndex !== null && selectedType === 'emoji' && (
                <div style={{ background: '#050a11', padding: '8px', borderRadius: '4px', border: '1px solid #2a3a4e' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#D4AF37' }}>이모지</h4>
                  <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '9px', color: '#888' }}>크기: {emojis[selectedIndex].size}px</label><input type="range" min="20" max="150" value={emojis[selectedIndex].size} onChange={(e) => updateItem(selectedIndex, 'emoji', { size: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '9px', color: '#888' }}>회전: {emojis[selectedIndex].rotation}°</label><input type="range" min="0" max="360" step="15" value={emojis[selectedIndex].rotation} onChange={(e) => updateItem(selectedIndex, 'emoji', { rotation: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <button onClick={() => deleteItem(selectedIndex, 'emoji')} style={{ width: '100%', padding: '6px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                    삭제
                  </button>
                </div>
              )}

              {selectedIndex !== null && selectedType === 'text' && (
                <div style={{ background: '#050a11', padding: '8px', borderRadius: '4px', border: '1px solid #2a3a4e' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '10px', color: '#D4AF37' }}>글자</h4>
                  <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '9px', color: '#888' }}>크기: {textStickers[selectedIndex].size}px</label><input type="range" min="12" max="72" value={textStickers[selectedIndex].size} onChange={(e) => updateItem(selectedIndex, 'text', { size: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <div style={{ marginBottom: '6px' }}><label style={{ fontSize: '9px', color: '#888' }}>회전: {textStickers[selectedIndex].rotation}°</label><input type="range" min="0" max="360" step="15" value={textStickers[selectedIndex].rotation} onChange={(e) => updateItem(selectedIndex, 'text', { rotation: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
                  <button onClick={() => deleteItem(selectedIndex, 'text')} style={{ width: '100%', padding: '6px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                    삭제
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: 'auto' }}>
                <button onClick={() => { if (cropMode) { cropImage(); } else { setCropMode(true); } }} style={{ padding: '8px', background: cropMode ? '#ff4444' : '#252535', color: cropMode ? 'white' : '#ffffff', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                  {cropMode ? '완료' : '자르기'}
                </button>
                <button onClick={downloadImage} style={{ padding: '8px', background: '#D4AF37', color: '#0a1929', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                  다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleBaseImageUpload} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
