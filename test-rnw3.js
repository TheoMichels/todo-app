const { StyleSheet } = require('react-native-web');
const styles = StyleSheet.create({
  box: {
    boxShadow: '0px 8px 24px rgba(139, 163, 192, 0.15)',
    elevation: 4,
    borderRadius: 16
  }
});
console.log(StyleSheet.getSheet().textContent);
