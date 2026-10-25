import React from 'react';
import { WordDetail, DensityParams } from '../logic/types';

interface WordCloudDisplayProps {
  words: WordDetail[];
  wordText: string; // The actual word (e.g., "강아지")
  densityParams: DensityParams; // Density parameters for the word cloud
}

const WordCloudDisplay: React.FC<WordCloudDisplayProps> = ({ words, wordText, densityParams }) => {
  // Increased base size for the container, removing Math.min constraint
  const containerWidth = 300 * Math.sqrt(densityParams.areaMultiplier);
  const containerHeight = 250 * Math.sqrt(densityParams.areaMultiplier);

  return (
    <div
      className="flex flex-wrap justify-center items-center p-2"
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        alignContent: 'center', // Center the content vertically
      }}
    >
      {words.map((item, index) => {
        if (item.isGap) {
          return (
            <span
              key={`gap-${index}`}
              style={{ display: 'inline-block', width: `${item.gapWidth}rem`, height: `${item.gapWidth}rem` }}
            />
          );
        }
        return (
          <span
            key={`word-${index}`}
            style={{
              fontSize: `${item.size}rem`,
              fontWeight: item.weight,
              margin: '0 0.2rem',
              whiteSpace: 'nowrap',
            }}
            className="text-text-light dark:text-text-dark"
          >
            {item.text}
          </span>
        );
      })}
    </div>
  );
};

export default WordCloudDisplay;
