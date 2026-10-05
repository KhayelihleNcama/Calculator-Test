from queue import Empty
class _LinkedList:
    class _Node:
        __slots__ = '_elements','_next'
        def __init__(self,element,next = None):
            self._elements = element
            self._next = next
    def __init__(self):
        self._head = None
        self._tail = None
        self._size = 0
    def __len__(self):
        return self._size
    def is_empty(self):
        return self._size == 0
    def dequeue(self):
        if self.is_empty():
            raise Empty("Queue stack is Empty")
        else:
            value = self._head._elements
            self._head =  self._head._next
            self._size -= 1   
        if self.is_empty():
            self._tail = None
        return value
    def enqueue(self,e):
        new_node = self._Node(e)
        
        if self.is_empty():
            self._head = new_node
        else:
            self._tail._next = new_node
        self._tail = new_node
        self._size += 1

class _BinTreeNode:
    def __init__(self, element = 0):
        self._element = element
        self._left = None
        self._right = None
        


class BinaryTree:
    def __init__(self, root):
        self._root = _BinTreeNode(root)
        self._tree_size = 0

    def preOrder(self, start=None):
        if start is None:
            start = self._root
            
        if start is None:
            return

        print(start._element, end = ', ')

        if start._left:
            self.preOrder(start._left)
            
        if start._right is not None:
            self.preOrder(start._right)
    def inOrder(self,start = None):
        if start is None:
            start = self._root
        if start is None:
            return 

        if start._left is not None:
            self.inOrder(start._left)

        print(start._element, end = ', ')

        if start._right is not None:
            self.inOrder(start._right)
    def BreadthFirst(self):
        q = _LinkedList()
        q.enqueue(self._root)
        while not q.is_empty():
            node = q.dequeue()
            print(node._element, end = ', ')
            if node._left is not None:
                q.enqueue(node._left)
            if node._right is not None:
                q.enqueue(node._right)
    def tree_Size(self,start = None):
        if start is None:
            start = self._root

        if start is None:
            return 0

        def count_nodes(node):
            if node is None:
                return 0
            return 1 + count_nodes(node._left) + count_nodes(node._right)

        return count_nodes(start)

        



# Create the binary tree
root = BinaryTree('R')
root._root._left = _BinTreeNode('A')
root._root._right = _BinTreeNode('D')

root._root._left._left = _BinTreeNode('C')
root._root._left._right = _BinTreeNode('B')
root._root._right._right = _BinTreeNode('E')




# Traverse the tree
print("Pre-Order Traversal:")
root.preOrder()
print()
print("In-Order Traversal:")
root.inOrder()
print()
print("Breadth-First Traversal:")
root.BreadthFirst()
print()
print("Tree size: ",root.tree_Size())

def calcTotal(myTree):
    if myTree is None:
        return 0

    if hasattr(myTree, '_root'):
         myTree = myTree._root

    if myTree is None:
        return 0

    total = 0
    if isinstance(myTree._element, (int, float)):
        total += myTree._element

    if myTree._left is not None:
        total += calcTotal(myTree._left)

    if myTree._right is not None:
        total += calcTotal(myTree._right)

    return total

print("Total: ", calcTotal(root))


