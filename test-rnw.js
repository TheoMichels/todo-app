const { StyleSheet } = require('react-native-web');
const styles = StyleSheet.create({
  box1: {
    shadowColor: '#8BA3C0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    borderRadius: 16
  },
  box2: {
    boxShadow: '0px 8px 24px rgba(139, 163, 192, 0.15)',
    borderRadius: 16
  }
});
console.log(styles.box1);
console.log(styles.box2);
