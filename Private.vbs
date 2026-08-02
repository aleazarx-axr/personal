Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Aleazaaar_\Desktop\Personal\"
WshShell.Run "cmd /c cd backend ^&^& npm run dev", 0, False
WshShell.Run "cmd /c cd frontend ^&^& npm run dev", 0, False
WScript.Sleep 5000
WshShell.Run "http://localhost:5173"
