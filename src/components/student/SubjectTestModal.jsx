import React, { useState } from 'react';

const SubjectTestModal = ({ isOpen, onClose, satSubjectTests, updateSubjectTests }) => {
  const [tests, setTests] = useState(satSubjectTests || []);
  const [subject, setSubject] = useState('');
  const [score, setScore] = useState(700);

  const subjectOptions = [
    "Math Level 1",
    "Math Level 2",
    "Biology",
    "Chemistry",
    "Physics",
    "Literature",
    "U.S. History",
    "World History"
    // Add other subject tests
  ];

  const addTest = () => {
    if (!subject) return;
    setTests([...tests, { subject, score }]);
    setSubject('');
    setScore(700);
  };

  const removeTest = (index) => {
    const newTests = [...tests];
    newTests.splice(index, 1);
    setTests(newTests);
  };

  const saveChanges = () => {
    updateSubjectTests(tests);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">SAT Subject Tests</h3>

        <div className="space-y-3 mb-4">
          {tests.map((test, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded">
              <span>{test.subject}: {test.score}</span>
              <button
                onClick={() => removeTest(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}

          {tests.length === 0 && (
            <div className="text-gray-400 text-sm">No subject tests added yet</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subject:</label>
            <select
              className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">Select...</option>
              {subjectOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Score (200-800):</label>
            <input
              type="number"
              min="200"
              max="800"
              step="10"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 rounded border border-gray-600"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={addTest}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
            disabled={!subject}
          >
            Add Test
          </button>

          <div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 transition-colors mr-2"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-3 py-1 bg-green-600 rounded hover:bg-green-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectTestModal;