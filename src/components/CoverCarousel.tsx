import { useMemo, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONT } from '@/theme';

export const MOBILE_WIDTH_BREAKPOINT = 700;

const DEFAULT_GAP = 12;
const DOTS_MAX_ITEMS = 12;

type CoverCarouselProps<T> = {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth: number;
  itemHeight: number;
  gap?: number;
  containerWidth: number;
};

export function CoverCarousel<T>({
  items,
  keyExtractor,
  renderItem,
  itemWidth,
  itemHeight,
  gap = DEFAULT_GAP,
  containerWidth,
}: CoverCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);

  const snapInterval = itemWidth + gap;
  const contentWidth = items.length * itemWidth + Math.max(0, items.length - 1) * gap;
  const maxScroll = Math.max(0, contentWidth - containerWidth);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = x >= maxScroll - 1 ? items.length - 1 : Math.round(x / snapInterval);
    const clamped = Math.max(0, Math.min(items.length - 1, next));
    if (clamped !== activeIndex) setActiveIndex(clamped);
  };

  const contentContainerStyle = useMemo(() => ({ gap }), [gap]);

  return (
    <View style={styles.root}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => (
          <View style={{ width: itemWidth, height: itemHeight }}>
            {renderItem(item, index)}
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        getItemLayout={(_, index) => ({
          length: snapInterval,
          offset: snapInterval * index,
          index,
        })}
      />
      <CarouselIndicator total={items.length} active={activeIndex} />
    </View>
  );
}

function CarouselIndicator({ total, active }: { total: number; active: number }) {
  if (total <= 1) return null;
  if (total > DOTS_MAX_ITEMS) {
    return (
      <View style={styles.counterWrap}>
        <Text style={styles.counterText}>
          {active + 1} / {total}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2a2a2a',
  },
  dotActive: {
    backgroundColor: '#7c5cff',
  },
  counterWrap: {
    alignItems: 'center',
  },
  counterText: {
    color: '#9aa0a6',
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: FONT.bold,
  },
});
