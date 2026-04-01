<>
  {!isEmbed && (
    <aside className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Mesh Composer</p>
          <h1>Wallpaper Blend Lab</h1>
          <p className="subtitle">
            Tune the atmosphere, softness, and grain to match the aesthetic mesh
            wallpapers you shared.
          </p>
        </div>
        <button
          className="ghost"
          type="button"
          onClick={() => updateSettings({ seed: settings.seed + 1 })}
        >
          Randomize
        </button>
      </div>

      <div className="control">
        <label htmlFor="palette">Palette</label>
        <div className="palette-row">
          <select
            id="palette"
            value={settings.paletteIndex}
            onChange={(event) =>
              updateSettings({ paletteIndex: Number(event.target.value) })
            }
          >
            {palettes.map((item, index) => (
              <option key={item.name} value={index}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="swatches" aria-hidden="true">
            {palette.anchors.map((color) => (
              <span key={color} style={{ background: color }} />
            ))}
          </div>
        </div>
      </div>

      <div className="control">
        <label htmlFor="softness">Wave softness</label>
        <input
          id="softness"
          type="range"
          min={12}
          max={120}
          value={settings.softness}
          onChange={(event) =>
            updateSettings({ softness: Number(event.target.value) })
          }
        />
        <p className="value">{settings.softness}px</p>
      </div>

      <div className="control">
        <label htmlFor="opacity">Wave opacity</label>
        <input
          id="opacity"
          type="range"
          min={0.15}
          max={0.9}
          step={0.01}
          value={settings.opacity}
          onChange={(event) =>
            updateSettings({ opacity: Number(event.target.value) })
          }
        />
        <p className="value">{settings.opacity.toFixed(2)}</p>
      </div>

      <div className="control">
        <label htmlFor="blurStrength">Overall blur</label>
        <input
          id="blurStrength"
          type="range"
          min={0}
          max={120}
          value={settings.blurStrength}
          onChange={(event) =>
            updateSettings({ blurStrength: Number(event.target.value) })
          }
        />
        <p className="value">{settings.blurStrength}px</p>
      </div>

      <div className="control">
        <label htmlFor="noise">Noise amount</label>
        <input
          id="noise"
          type="range"
          min={0}
          max={0.4}
          step={0.01}
          value={settings.noiseAmount}
          onChange={(event) =>
            updateSettings({ noiseAmount: Number(event.target.value) })
          }
        />
        <p className="value">{settings.noiseAmount.toFixed(2)}</p>
      </div>

      <div className="control">
        <label htmlFor="grain">Grain scale</label>
        <input
          id="grain"
          type="range"
          min={120}
          max={320}
          value={settings.grainScale}
          onChange={(event) =>
            updateSettings({ grainScale: Number(event.target.value) })
          }
        />
        <p className="value">{settings.grainScale}px</p>
      </div>

      <div className="control">
        <label htmlFor="renderScale">Render scale</label>
        <input
          id="renderScale"
          type="range"
          min={0.5}
          max={1}
          step={0.05}
          value={settings.renderScale}
          onChange={(event) =>
            updateSettings({ renderScale: Number(event.target.value) })
          }
        />
        <p className="value">{Math.round(settings.renderScale * 100)}%</p>
      </div>

      <div className="compile">
        <button
          className="compile-btn"
          type="button"
          onClick={handleCompile}
          disabled={isSaving}
        >
          {isSaving ? "Compiling…" : "Compile Wallpaper"}
        </button>
        {statusMessage && <p className="status">{statusMessage}</p>}
        {embedUrl && (
          <div className="embed-link">
            <p className="label">Embed link</p>
            <code>{embedUrl}</code>
          </div>
        )}
      </div>
    </aside>
  )}
</>;
