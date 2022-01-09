import React, { useEffect } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import Animated, {
  Extrapolate,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withTiming
} from "react-native-reanimated";
import MaskedView from "@react-native-community/masked-view";

import GestureHandler from "./GestureHandler";

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const PERSPECTIVE = 600;
const RADIUS_REL = VISIBLE_ITEMS * 0.8;

const EMPTY = 'empty';
const EMPTY_ARR = [EMPTY, EMPTY];

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    width: width,
    overflow: "hidden",
    borderWidth: 1
  },
  item: {
    justifyContent: "center",
  },
  label: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: "center",
    textAlignVertical: "center",
  },
});

// interface PickerProps {
//   defaultValue: number;
//   values: { value: number; label: string }[];
// }

const ItemView = ({ item, idx, animatedValue, itemHeight, itemStyle, labelStyle }) => {
  const itemAnimatedStyles = useAnimatedStyle(() => {
    const startValue = (animatedValue.value - itemHeight * 2) / -itemHeight;
    const input = [idx - RADIUS_REL, idx, idx + RADIUS_REL];
    
    const y = interpolate(
      startValue,
      input,
      [1, 0, -1],
      Extrapolate.CLAMP
    );
    const rotateX = `${Math.asin(y) * (180/Math.PI)}deg`;

    const scale = interpolate(
      startValue,
      input,
      [0.4, 1, 0.4],
      Extrapolate.CLAMP
    );

    return ({
      transform: [
        { perspective: PERSPECTIVE },
        { rotateX },
        { scale }
      ],
    });
  });

  const itemStyles = [
    styles.item,
    { height: itemHeight },
    itemStyle,
    itemAnimatedStyles
  ];
  const labelStyles = [
    styles.label,
    { lineHeight: itemHeight },
    labelStyle
  ];

  return (
    <Animated.View style={itemStyles}>
      <Text style={labelStyles}>{item.label}</Text>
    </Animated.View>
  );
};

const Picker = ({
  values,
  defaultValue,
  onChange,
  style,
  tintColor,
  itemHeight,
  itemStyle,
  labelStyle
}) => {
  const allValues = [...EMPTY_ARR, ...values, ...EMPTY_ARR]
  const translateY = useSharedValue(0);
  const _itemHeight = itemHeight ?? ITEM_HEIGHT;

  useEffect(() => {
    const idx = values.findIndex((v) => defaultValue === v.value);
    const defaultIdx = idx === -1 ? 0 : idx;

    translateY.value = withTiming(-defaultIdx * _itemHeight);
  }, [defaultValue]);

  const maskElementAnimatedStyles = useAnimatedStyle(() => (
    {
      transform: [{ translateY: translateY.value }]
    }
  ));

  const maskElement = (
    <Animated.View style={maskElementAnimatedStyles}>
      {allValues.map((v, i) => { 
        return v === EMPTY ? (
          <View key={`empty-${i}`} style={[styles.item, { height: _itemHeight }]} />
        ) : (
          <ItemView
            key={v.value}
            item={v}
            idx={i}
            animatedValue={translateY}
            itemHeight={_itemHeight}
            {...{
              itemStyle,
              labelStyle
            }}
          />
        );
      })}
    </Animated.View>
  );

  const containerStyles = [
    styles.container,
    { height: _itemHeight * VISIBLE_ITEMS },
    style
  ];

  return (
    <View style={containerStyles}>
      <MaskedView {...{ maskElement }}>
        <View style={{ height: _itemHeight, backgroundColor: "grey", opacity: 0.3 }} />
        <View style={{ height: _itemHeight, backgroundColor: "grey" }} />
        <View style={{ height: _itemHeight, backgroundColor: tintColor ?? "black" }} />
        <View style={{ height: _itemHeight, backgroundColor: "grey" }} />
        <View style={{ height: _itemHeight, backgroundColor: "grey", opacity: 0.3 }} />
      </MaskedView>
      <GestureHandler
        max={values.length}
        value={translateY}
        onChange={onChange ?? (() => {})}
        itemHeight={_itemHeight}
      />
    </View>
  );
};

export default Picker;