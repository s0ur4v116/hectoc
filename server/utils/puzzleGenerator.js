// server/utils/puzzleGenerator.js
function generateHectocPuzzle() {
  // Generate 6 random digits between 1-9
  const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1).join('');
  
  return {
    digits,
    solution: null // We won't pre-calculate solutions as they can be multiple
  };
}

// Validate if a solution is correct for a given Hectoc puzzle
function validateHectocSolution(digits, solution) {
  try {
    // Check if all digits are used in order
    let digitsIndex = 0;
    let solutionIndex = 0;
    
    while (solutionIndex < solution.length && digitsIndex < digits.length) {
      if (solution[solutionIndex] === digits[digitsIndex]) {
        digitsIndex++;
      }
      solutionIndex++;
    }
    
    if (digitsIndex !== digits.length) {
      return false; // Not all digits were used or not in order
    }
    
    // Evaluate the expression
    // Note: Using eval is generally not recommended for security reasons
    // In a production app, use a proper expression parser/evaluator
    const result = eval(solution);
    
    return result === 100;
  } catch (error) {
    return false; // Invalid expression
  }
}

module.exports = {
  generateHectocPuzzle,
  validateHectocSolution
};

