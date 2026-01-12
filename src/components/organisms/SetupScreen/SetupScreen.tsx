import { useCallback } from 'react';
import type { SetupScreenProps } from '../../../types/session';
import { MIN_ROUNDS, MAX_ROUNDS } from '../../../types/session';
import './SetupScreen.css';

/**
 * セッション設定画面コンポーネント
 * 繰り返し回数を設定し、セッションを開始する
 */
export function SetupScreen({
  totalRounds,
  onTotalRoundsChange,
  onStart,
  className,
}: SetupScreenProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        onTotalRoundsChange(value);
      }
    },
    [onTotalRoundsChange]
  );

  const handleIncrease = useCallback(() => {
    if (totalRounds < MAX_ROUNDS) {
      onTotalRoundsChange(totalRounds + 1);
    }
  }, [totalRounds, onTotalRoundsChange]);

  const handleDecrease = useCallback(() => {
    if (totalRounds > MIN_ROUNDS) {
      onTotalRoundsChange(totalRounds - 1);
    }
  }, [totalRounds, onTotalRoundsChange]);

  const isAtMin = totalRounds <= MIN_ROUNDS;
  const isAtMax = totalRounds >= MAX_ROUNDS;

  return (
    <div
      className={`setup-screen ${className ?? ''}`}
      data-testid="setup-screen"
    >
      <h2 className="setup-screen__title">瞬発思考</h2>

      <p className="setup-screen__description">
        20秒間で思考を書き出し、振り返る。
        <br />
        これを繰り返して思考を深めましょう。
      </p>

      <div className="setup-screen__round-setting">
        <label
          htmlFor="total-rounds"
          className="setup-screen__label"
        >
          繰り返し回数
        </label>

        <div className="setup-screen__round-input">
          <button
            type="button"
            className="setup-screen__adjust-button"
            onClick={handleDecrease}
            disabled={isAtMin}
            aria-label="回数を減らす"
          >
            −
          </button>

          <input
            id="total-rounds"
            type="number"
            className="setup-screen__input"
            value={totalRounds}
            onChange={handleInputChange}
            min={MIN_ROUNDS}
            max={MAX_ROUNDS}
            aria-label="繰り返し回数"
          />

          <button
            type="button"
            className="setup-screen__adjust-button"
            onClick={handleIncrease}
            disabled={isAtMax}
            aria-label="回数を増やす"
          >
            +
          </button>
        </div>

        <span className="setup-screen__unit">回</span>
      </div>

      <button
        type="button"
        className="setup-screen__start-button"
        onClick={onStart}
      >
        開始する
      </button>
    </div>
  );
}
