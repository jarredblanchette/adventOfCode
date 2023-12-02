using System;
using System.IO;
using System.Linq;


namespace Day01
{
    internal class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                using var file = new StreamReader("Input.txt");
                var accumulator = 0;

                var line = file.ReadLine();
                while (line != null)
                {
                    // process
                    var result = GetFirstAndLast(line);
                    accumulator += result;

                    line = file.ReadLine();
                }

                Console.WriteLine(accumulator);
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        public static short GetFirstAndLast(string line)
        {
            if (line.Length == 0) return -1;

            ushort? left = null;
            ushort? right = null;

            string[] intsAsWords = { "one", "two", "three", "four", "five", "six", "seven", "eight", "nine" };

            for (var index = 0; index < line.Length; index++)
            {
                var character = line[index];
                if (char.IsDigit(character))
                {
                    var shortChar = (ushort)char.GetNumericValue(character);
                    right = shortChar;
                    left ??= shortChar;
                }
                else
                {
                    var lookAheadWindow = Math.Min(line.Length - index, 5);
                    var validOptions = intsAsWords.Where(e => e.Length <= lookAheadWindow).ToArray();

                    foreach (var candidate in validOptions)
                    {
                        var lookahead = line.Substring(index, candidate.Length);
                        if (lookahead == candidate)
                        {
                            var shortString = (ushort)Array.IndexOf(intsAsWords, candidate);
                            shortString += 1;

                            right = shortString;
                            left ??= shortString;
                            break;
                        }
                    }
                }
            }

            if (left == null || right == null) return -1;

            return (short)(10 * left + right);
        }
    }
}