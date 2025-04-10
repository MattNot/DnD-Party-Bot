import os
import signal
import subprocess

def stop_bot():
    try:
        process = subprocess.Popen(['ps', 'aux'], stdout=subprocess.PIPE)
        output, _ = process.communicate()

        for line in output.decode().splitlines():
            if 'app.py' in line:
                pid = int(line.split()[1])

                os.kill(pid, signal.SIGTERM)
                print(f"Process 'app.py' terminated, PID {pid} stopped.")
    
    except Exception as e:
        print(f"Error while killing processes: {e}")

stop_bot()
