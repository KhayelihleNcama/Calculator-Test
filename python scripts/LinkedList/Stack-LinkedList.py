from queue import Empty


class LinkedStack:
    class _Node:
        __slots__ = '_element','_next'
        def __init__(self,_element,_next = None):
            self._element = _element
            self._next = _next
    def __init__(self):
        self._head = None
        self._size = 0


    def __len__(self):
        return self._size
    def is_empty(self):
        return self._size == 0
    def push(self,e):
        new_node = self._Node(e, self._head)
        self._head = new_node
        
        self._size += 1
    def pop(self):
        if self.is_empty():
            raise Empty("Stack is Empty")
        else:
            value = self._head._element
            self._head = self._head._next
            self._size -= 1
            return value
    def top(self):
        if self.is_empty():
            raise Empty("Stack is Empty")
        else:
            return self._head._element
    def populate(self,elements):
        for e in elements:
            self.push(e)   
    def traverseAndprint(self):
        currentNode = self._head
        while currentNode:
            print(currentNode._element,end =' -> ')
            currentNode = currentNode._next
        print("null")
    def find_val(self,_val):
        currentNode = self._head
        while currentNode:
            if _val == currentNode._element:
                print(currentNode._element,"TRUE")
            else:
                print("FALSE")
            currentNode = currentNode._next
    
stacknode = LinkedStack()

stacknode.populate(['A','B','C'])
stacknode.find_val("B")

stacknode.traverseAndprint()

        

