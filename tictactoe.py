import tflite_runtime.interpreter as tflite
import numpy as np
import sys

def state_to_tensor(state, move):
    vec = np.zeros(9, dtype=np.float32)
    if move != -1:
        vec[move] = 1
    tensor = np.array((vec, state))
    tensor = tensor.reshape((1,2,9))
    return tensor

def available_moves(state):
    available_moves = []
    for index, value in enumerate(state):
        if '0' in value:
            available_moves.append(index)
    # moves = [s for s, v in enumerate(np.nditer(state)) if v == 0]
    return available_moves

m_path = ""
difficulty = sys.argv[2]
if 'dummy' in difficulty:
    m_path = 'AI/model_values_tic_tac_toe__second_0.tflite'
elif 'easy' in difficulty:
    m_path = 'AI/model_values_tic_tac_toe__second_24.tflite'
elif 'medium' in difficulty:
    m_path = 'AI/model_values_tic_tac_toe__second_49.tflite'
elif 'hard' in difficulty:
    m_path = 'AI/model_values_tic_tac_toe__second_74.tflite'
elif 'expert' in difficulty:
    m_path = 'AI/model_values_tic_tac_toe__second_99.tflite'
else:
     m_path = 'AI/model_values_tic_tac_toe__second_99.tflite'

interpreter = tflite.Interpreter(model_path=m_path)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

floating_model = input_details[0]['dtype'] == np.float32

# What does this state look like?
state = np.zeros((9), dtype=np.float32)

data = sys.argv[1]
data = data.split(',')
for index, value in enumerate(data):
    if '1' in value:
        state[index] = float(1.0)
    elif '-1' in value:
        state[index] = float(-1.0)

# Loop through each possible move and decide what's best
best_move = -1
best_value = -999999

# Loop only through legal moves
for move in available_moves(data):
    input_data = state_to_tensor(state, move)
    interpreter.set_tensor(input_details[0]['index'], input_data)

    #Invoke model
    interpreter.invoke()

    # Get result
    output_data = interpreter.get_tensor(output_details[0]['index'])
    result = np.squeeze(output_data)

    # Obtain the best move possible
    if result > best_value:
        best_value = result
        best_move = move

print(best_move)
