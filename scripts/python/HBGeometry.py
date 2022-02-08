import math

def GetLengthHelper(dx, dy, dz):
    num = None
    x = abs(dx)
    y = abs(dy)
    z = abs(dz)
    if (y >= x) and (y >= z):
        num = x
        x = y
        y = num
    elif (z >= x) and (z >= y):
        num = x
        x = z
        z = num
    if x > 2.2250738585072014E-308:
        num = 1.0 / x
        y *= num
        z *= num
        return x * math.sqrt((1.0 + (y * y)) + (z * z))
    if x > 0.0:
        return x
    return 0.0
 
class Point3d:
    def __init__(self,x,y,z):
        self.X = x
        self.Y = y
        self.Z = z
    @property
    def x(self):
        return self.X
    @property
    def y(self):
        return self.Y
    @property
    def z(self):
        return self.Z
    def DistanceTo(self,other):
        dy = other.Y - self.Y
        dz = other.Z - self.Z
        return GetLengthHelper(other.X - self.X, dy, dz)

    def DistanceToSquared(self,other):
        #print('DistanceToSquared %s,%s,%s,%s,%s,%s'%(self.x,self.y,self.z,other.x,other.y,other.z))
        vec = Point3d.CreateVector(self,other)
        return vec.SquareLength
    
    @staticmethod
    def CreateVector(pt_from, pt_to):
        return Vector3d(pt_to.x - pt_from.x, pt_to.y - pt_from.y, pt_to.z - pt_from.z)

class Vector3d:
    def __init__(self,x = 0, y = 0, z = 0):
        self.x = x
        self.y = y
        self.z = z
    @property
    def Length(self):
        GetLengthHelper(self.x, self.y, self.z)
    @property
    def SquareLength(self):
        return (self.x * self.x) + (self.y * self.y) + (self.z * self.z)
    

class Line3(object):
    def __init__(self, Ax=None, Ay=None, Az=None, Bx=None, By=None, Bz=None):
        self.__tolerance = 1E-14
        self.Ax = Ax
        self.Ay = Ay
        self.Az = Az
        self.Bx = Bx
        self.By = By
        self.Bz = Bz

    @classmethod
    def create(cls, **kwargs):
        newLine = cls()
        if len(kwargs) == 1:
            other = kwargs.get('other')
            if getattr(other, 'set'):
                newLine.set(other)
        elif len(kwargs) == 2:
            start = kwargs.get('Start')
            end = kwargs.get('End')
            newLine.Ax = start.X
            newLine.Ay = start.Y
            newLine.Az = start.Z
            newLine.Bx = end.X
            newLine.By = end.Y
            newLine.Bz = end.Z
        elif len(kwargs) == 6:
            newLine.Ax = kwargs.get('Ax')
            newLine.Ay = kwargs.get('Ay')
            newLine.Az = kwargs.get('Az')
            newLine.Bx = kwargs.get('Bx')
            newLine.By = kwargs.get('By')
            newLine.Bz = kwargs.get('Bz')
        return newLine

    def closestPoint(self, pt):
        return self.closestPointEx(pt.X,pt.Y,pt.Z)
        
    def closestPointEx(self, x, y, z):
        num2 = self.lengthSquared
        if num2 < 1E-32:
            return 0.5
        return (((self.Ay - y) * (self.Ay - self.By)) - ((self.Ax - x) * (self.Bx - self.Ax))) / num2

    def distanceTo(self, pt):
        return self.distanceToEx(pt.x, pt.y, pt.z)
        
    def distanceToEx(self,x,y,z):
        return math.sqrt(self.distanceToSquared(x, y, z))

    def distanceToSquared(self, x, y, z):
        t = self.closestPointEx(x, y, z)
        # print('t=%s'%t)
        return self.PointAt(t).DistanceToSquared(Point3d(x, y, z))

    @classmethod
    def duplicate(cls):
        return Line3(cls)

    def intersect(self, *args, **kwargs):
        if len(kwargs) == 3:
            A = kwargs.get('Line3A')
            B = kwargs.get('Line3B')
            t = kwargs.get('t')
            self.intersect(A.Ax, A.Ay, A.Az, A.Bx, A.By, A.Bz, B.Ax, B.Ay, B.Az, B.Bx, B.By, B.Bz, t)

        if len(kwargs) == 4:
            A = kwargs.get('Line3A')
            B = kwargs.get('Line3B')
            t0 = kwargs.get('t0')
            t1 = kwargs.get('t1')
            self.intersect(A.Ax, A.Ay, A.Az, A.Bx, A.By, A.Bz, B.Ax, B.Ay, B.Az, B.Bx, B.By, B.Bz, t0, t1)

        if args:
            Ax = args[0]
            Ay = args[1]
            Az = args[2]
            Bx = args[3]
            By = args[4]
            Bz = args[5]
            Cx = args[6]
            Cy = args[7]
            Cz = args[8]
            Dx = args[9]
            Dy = args[10]
            Dz = args[11]
            num = ((Dy - Cy) * (Bx - Ax)) - ((Dx - Cx) * (By - Ay))
            num2 = ((Dx - Cx) * (Ay - Cy)) - ((Dy - Cy) * (Ax - Cx))
            if len(args) == 13:
                t = args[12]
                if abs(num) < self.__tolerance:
                    num3 = ((Bx - Ax) * (Ay - Cy)) - ((By - Ay) * (Ax - Cx))
                    if ((abs(num2) < self.__tolerance) and (abs(num3) < self.__tolerance)):
                        return LineX.Coincident
                    return LineX.Parallel
                t = num2 / num
                return LineX.Point

            if len(args) == 14:
                t0 = args[12]
                t1 = args[13]
                num3 = ((Bx - Ax) * (Ay - Cy)) - ((By - Ay) * (Ax - Cx))
                if abs(num) < self.__tolerance:
                    if ((abs(num2) < self.__tolerance) and (abs(num3) < self.__tolerance)):
                        return LineX.Coincident
                    return LineX.Parallel
                t0 = num2 / num
                t1 = num3 / num
                return LineX.Point

    @property
    def length(self):
        return math.sqrt(self.lengthSquared)

    @property
    def lengthSquared(self):
        return (((self.Ax - self.Bx) * (self.Ax - self.Bx)) + ((self.Ay - self.By) * (self.Ay - self.By))) \
               + ((self.Az - self.Bz) * (self.Az - self.Bz))

    def PointAt(self,t):
        nX = self.Ax + (t * (self.Bx - self.Ax))
        nY = self.Ay + (t * (self.By - self.Ay))
        return Point3d(nX, nY, self.Az + (t * (self.Bz - self.Az)))


    def set(self,**kwargs):
        if len(kwargs) == 1:
            other = kwargs.get('other')
            self.Ax = other.Ax
            self.Ay = other.Ay
            self.Az = other.Az
            self.Bx = other.Bx
            self.By = other.By
            self.Bz = other.Bz
        elif len(kwargs) ==2:
            A = kwargs.get('Start')
            B = kwargs.get('End')
            self.Ax = A.x
            self.Ay = A.y
            self.Az = A.z
            self.Bx = B.x
            self.By = B.y
            self.Bz = B.z

# l = Line3.create(Start=Point3d(0,0,0),End=Point3d(500,0,0))
# print(l.length)
# pt = Point3d(-200,500,0)
# pt_a = l.PointAt(1) 
# print('%s,%s,%s'%(pt_a.x,pt_a.y,pt_a.z))
# print(l.distanceTo(pt))
# print(l.closestPoint(pt))
