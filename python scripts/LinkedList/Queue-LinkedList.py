from queue import Empty


class LinkedList():
    class _Node():
        __slots__ = '_element', '_next'

        def __init__(self, element, next = None):
            self._element = element
            self._next = next

    def __init__(self):
        self._head = None
        self._tail = None
        self._size = 0

    def __len__(self):
        return self._size

    def is_empty(self):
        return self._size == 0

    def front(self):
        if self.is_empty():
            raise Empty("Queue is Empty")
        return self._head._element

    def top(self):
        return self.front()

    def dequeue(self):
        if self.is_empty():
            raise Empty("Queue is Empty")

        value = self._head._element
        self._head = self._head._next
        self._size -= 1

        if self.is_empty():
            self._head = None
            self._tail = None

        return value

    def enqueue(self, e):
        new_node = self._Node(e)
        if self.is_empty():
            self._head = new_node
        else:
            self._tail._next = new_node
        self._tail = new_node
        self._size += 1

    def traverse(self):
        current_node = self._head
        while current_node is not None:
            print(current_node._element, end=' -> ')
            current_node = current_node._next
        print("null")


queue = LinkedList()
queue.enqueue("A")
queue.enqueue("B")
queue.enqueue("C")
queue.traverse()
print("Front:", queue.front())
print("Dequeue:", queue.dequeue())
queue.traverse()

