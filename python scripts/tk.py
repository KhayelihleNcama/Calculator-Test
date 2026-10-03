import tkinter as tk

root = tk.Tk()
root.title("My Editor")

text = tk.Text(root, wrap="word", undo=True)
text.pack(expand=True, fill="both")

root.mainloop()