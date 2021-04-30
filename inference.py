import tflite_runtime.interpreter as tflite
import numpy as np
import sys

def state_to_tensor(state, move):
    vec = np.zeros((1,7), dtype=np.float32)
    if move != -1:
        vec[0, move] = 1
        tensor = np.append(vec, state, axis=0)
        tensor = tensor.reshape((1,7,7,1))
        return tensor

def available_moves(state):
    avaiable_move_list = []
    for i in range(7):
        if state[0][i] == 0:
            avaiable_move_list.append(i)
    return avaiable_move_list

m_path = ""
difficulty = sys.argv[2]
if 'dummy' in difficulty:
    m_path = 'AI/model_values_connect_four__second_0_dummy.tflite'
elif 'easy' in difficulty:
    m_path = 'AI/model_values_connect_four__second_49_easy.tflite'
elif 'medium' in difficulty:
    m_path = 'AI/model_values_connect_four__second_99_medium.tflite'
elif 'hard' in difficulty:
    m_path = 'AI/model_values_connect_four__second_149_hard.tflite'
elif 'expert' in difficulty:
    m_path = 'AI/model_values_connect_four__first_hard.tflite'
else:
     m_path = 'AI/model_values_connect_four__first_hard.tflite'

interpreter = tflite.Interpreter(model_path=m_path)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

floating_model = input_details[0]['dtype'] == np.float32

state = np.zeros((6,7), dtype=np.float32)
#state[0][0] = float(1)

data = sys.argv[1]
data_split = data.split('.')
data_split = [i.split(',') for i in data_split]
for r_ctr, row in enumerate(data_split):
    for c_ctr, value in enumerate(row):
        state[r_ctr][c_ctr] = float(value)

# Loop through each possible move and decide what's best
best_move = -1
best_value = -1
# Loop only through legal moves
for move in available_moves(state):
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
